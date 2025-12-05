import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  MessageCircle, Send, Bot, User, X, Minimize2, Maximize2,
  Phone, Clock, Sparkles, Loader2, ThumbsUp, ThumbsDown, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const quickQuestions = [
  { id: 'hours', text: 'ما هي ساعات العمل؟', icon: '🕐' },
  { id: 'pricing', text: 'ما هي الأسعار؟', icon: '💰' },
  { id: 'support', text: 'أحتاج دعم فني', icon: '🔧' },
  { id: 'status', text: 'حالة طلبي', icon: '📦' },
];

const knowledgeBase = {
  hours: 'ساعات العمل من الأحد إلى الخميس، من 8 صباحاً حتى 5 مساءً.',
  pricing: 'لدينا عدة باقات تبدأ من 99 ريال شهرياً. هل تريد معرفة المزيد عن باقة معينة؟',
  support: 'يسعدني مساعدتك! ما هي المشكلة التي تواجهها؟',
  status: 'لتتبع طلبك، يرجى تزويدي برقم الطلب.',
};

export default function CustomerAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'مرحباً! 👋 أنا مساعدك الافتراضي. كيف يمكنني مساعدتك اليوم؟',
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [escalationNeeded, setEscalationNeeded] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (userMessage) => {
      // Check if it matches a quick question
      const quickMatch = Object.entries(knowledgeBase).find(([key]) => 
        userMessage.toLowerCase().includes(key) || 
        quickQuestions.find(q => q.id === key && userMessage.includes(q.text))
      );

      if (quickMatch) {
        return { answer: quickMatch[1], needsAgent: false };
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مساعد خدمة عملاء ودود ومحترف. أجب على استفسار العميل بشكل مفيد ومختصر.

استفسار العميل: ${userMessage}

قواعد:
1. كن ودوداً ومهنياً
2. أجب بشكل مختصر ومفيد
3. إذا كان السؤال معقداً أو يحتاج متخصص، اقترح التحويل لوكيل
4. استخدم العربية فقط`,
        response_json_schema: {
          type: "object",
          properties: {
            answer: { type: "string" },
            needsAgent: { type: "boolean" },
            suggestedDepartment: { type: "string" },
            sentiment: { type: "string" },
            followUpQuestions: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setIsTyping(false);
      const assistantMessage = {
        id: Date.now(),
        role: 'assistant',
        content: data.answer,
        needsAgent: data.needsAgent,
        department: data.suggestedDepartment,
        followUp: data.followUpQuestions,
        time: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      if (data.needsAgent) {
        setEscalationNeeded(true);
      }
    },
    onError: () => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: 'عذراً، حدث خطأ. هل تريد التحدث مع أحد ممثلي خدمة العملاء؟',
        needsAgent: true,
        time: new Date()
      }]);
    }
  });

  const sendMessage = (text = input) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      time: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    chatMutation.mutate(text);
  };

  const handleQuickQuestion = (question) => {
    sendMessage(question.text);
  };

  const requestAgent = () => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'system',
      content: '🔄 جاري تحويلك إلى أحد ممثلي خدمة العملاء. يرجى الانتظار...',
      time: new Date()
    }]);
    toast.success('سيتواصل معك أحد ممثلينا قريباً');
  };

  const rateFeedback = (messageId, isPositive) => {
    toast.success(isPositive ? 'شكراً لتقييمك الإيجابي!' : 'شكراً لملاحظتك، سنعمل على التحسين');
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg flex items-center justify-center z-50"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.8 }}
      className={`fixed bottom-6 left-6 z-50 ${isMinimized ? 'w-72' : 'w-96'}`}
      dir="rtl"
    >
      <div className="bg-gradient-to-b from-[#0f1629] to-[#1a1f3c] rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-purple-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold">مساعد العملاء</p>
                <p className="text-white/70 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  متصل الآن
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10" onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <ScrollArea className="h-80 p-4" ref={scrollRef}>
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map(message => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[85%] ${message.role === 'system' ? 'w-full' : ''}`}>
                        {message.role === 'system' ? (
                          <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-3 text-center">
                            <p className="text-amber-400 text-sm">{message.content}</p>
                          </div>
                        ) : (
                          <div className={`rounded-2xl p-3 ${
                            message.role === 'user' 
                              ? 'bg-slate-700 rounded-tr-sm' 
                              : 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-tl-sm'
                          }`}>
                            <p className="text-white text-sm">{message.content}</p>
                            
                            {/* Follow-up questions */}
                            {message.followUp?.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.followUp.slice(0, 2).map((q, i) => (
                                  <Button
                                    key={i}
                                    size="sm"
                                    variant="ghost"
                                    className="h-auto p-1 text-xs text-cyan-400 hover:text-cyan-300"
                                    onClick={() => sendMessage(q)}
                                  >
                                    <ArrowRight className="w-3 h-3 ml-1" />
                                    {q}
                                  </Button>
                                ))}
                              </div>
                            )}

                            {/* Agent transfer */}
                            {message.needsAgent && (
                              <Button
                                size="sm"
                                className="mt-2 bg-green-600 hover:bg-green-700 h-7 text-xs"
                                onClick={requestAgent}
                              >
                                <Phone className="w-3 h-3 ml-1" />
                                تحدث مع وكيل
                              </Button>
                            )}

                            {/* Feedback */}
                            {message.role === 'assistant' && !message.needsAgent && (
                              <div className="flex gap-1 mt-2 justify-end">
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => rateFeedback(message.id, true)}>
                                  <ThumbsUp className="w-3 h-3 text-slate-400 hover:text-green-400" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => rateFeedback(message.id, false)}>
                                  <ThumbsDown className="w-3 h-3 text-slate-400 hover:text-red-400" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                        <span className="text-slate-500 text-xs mt-1 block">
                          {message.time.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <div className="flex justify-end">
                    <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-2xl p-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Questions */}
            <div className="px-4 pb-2">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {quickQuestions.map(q => (
                  <Button
                    key={q.id}
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-slate-600 whitespace-nowrap flex-shrink-0"
                    onClick={() => handleQuickQuestion(q)}
                  >
                    {q.icon} {q.text}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 pt-0">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="اكتب رسالتك..."
                  className="bg-slate-800/50 border-slate-700 text-white"
                  disabled={chatMutation.isPending}
                />
                <Button
                  size="icon"
                  className="bg-gradient-to-r from-cyan-600 to-purple-600"
                  onClick={() => sendMessage()}
                  disabled={chatMutation.isPending || !input.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}