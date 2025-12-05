import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, X, Send, Bot, User, Sparkles, Package,
  Wrench, Truck, HelpCircle, Clock, CheckCircle, Loader2,
  Minimize2, Maximize2, Book
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const quickQuestions = [
  { icon: Package, text: 'كيف أضيف صنف للمخزون؟', category: 'inventory' },
  { icon: Wrench, text: 'كيف أجدول صيانة؟', category: 'maintenance' },
  { icon: Truck, text: 'كيف أطلب عرض سعر؟', category: 'suppliers' },
  { icon: HelpCircle, text: 'ما هي حالة مخزوني؟', category: 'inventory' },
];

const knowledgeBase = {
  inventory: {
    keywords: ['مخزون', 'قطع', 'صنف', 'إضافة', 'كمية', 'نقص', 'طلب'],
    responses: [
      'لإضافة صنف جديد للمخزون: اذهب إلى إدارة المخزون > اضغط "إضافة قطعة" > أدخل البيانات المطلوبة.',
      'يمكنك تتبع مستويات المخزون من لوحة التحكم الرئيسية أو من صفحة إدارة المخزون.',
      'عند انخفاض المخزون عن الحد الأدنى، ستظهر تنبيهات تلقائية.',
    ]
  },
  maintenance: {
    keywords: ['صيانة', 'جدولة', 'فني', 'إصلاح', 'عطل', 'مهمة'],
    responses: [
      'لجدولة صيانة: اذهب إلى الصيانة > اضغط "صيانة جديدة" > حدد الجهاز والتاريخ والفني.',
      'يمكنك متابعة حالة الصيانة من لوحة تحكم الصيانة.',
      'للصيانة الطارئة، اختر "أولوية حرجة" عند الإنشاء.',
    ]
  },
  suppliers: {
    keywords: ['مورد', 'عرض سعر', 'طلب', 'شراء', 'RFQ'],
    responses: [
      'لطلب عرض سعر: اذهب إلى إدارة الموردين > طلبات العروض > طلب جديد.',
      'يمكنك مقارنة عروض الموردين واختيار الأفضل من نفس الصفحة.',
      'تقييم الموردين يتم تلقائياً بناءً على الجودة والتسليم والسعر.',
    ]
  },
  technicians: {
    keywords: ['فني', 'تطبيق', 'موبايل', 'مهام', 'تقرير'],
    responses: [
      'الفنيون يستخدمون تطبيق الهاتف لاستلام المهام وإرسال التقارير.',
      'يمكن للفني تحديث حالة المهمة وإرفاق صور مباشرة من التطبيق.',
      'لمراجعة أداء الفنيين: اذهب إلى التقارير المتقدمة > أداء الفنيين.',
    ]
  }
};

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const aiMutation = useMutation({
    mutationFn: async (question) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مساعد ذكي لنظام إدارة المرافق والصيانة. أجب بإيجاز ووضوح باللغة العربية.

قاعدة المعرفة:
- المخزون: إضافة أصناف، تتبع الكميات، تنبيهات النقص، طلبات الشراء
- الصيانة: جدولة الصيانة، متابعة المهام، الصيانة الوقائية والتصحيحية
- الموردين: طلبات عروض الأسعار، تقييم الموردين، تتبع الطلبات
- الفنيين: تطبيق الهاتف، المهام، التقارير الميدانية

السؤال: ${question}

أجب بشكل مختصر ومفيد:`,
        response_json_schema: {
          type: "object",
          properties: {
            answer: { type: "string" },
            relatedTopics: { type: "array", items: { type: "string" } },
            actionSuggestion: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      const response = {
        id: Date.now(),
        role: 'assistant',
        content: data.answer,
        relatedTopics: data.relatedTopics,
        actionSuggestion: data.actionSuggestion,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    },
    onError: () => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }
  });

  const findLocalAnswer = (question) => {
    const lowerQ = question.toLowerCase();
    for (const [category, data] of Object.entries(knowledgeBase)) {
      if (data.keywords.some(kw => lowerQ.includes(kw))) {
        return data.responses[Math.floor(Math.random() * data.responses.length)];
      }
    }
    return null;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Try local knowledge base first
    const localAnswer = findLocalAnswer(input);
    if (localAnswer) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: localAnswer,
          timestamp: new Date()
        }]);
        setIsTyping(false);
      }, 500);
    } else {
      // Use AI for complex questions
      aiMutation.mutate(input);
    }
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
    setTimeout(() => handleSend(), 100);
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 shadow-lg flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        height: isMinimized ? 'auto' : '500px'
      }}
      className="fixed bottom-6 left-6 z-50 w-96 bg-[#0f1629] border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">المساعد الذكي</h3>
            <p className="text-slate-400 text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              متصل الآن
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <Maximize2 className="w-4 h-4 text-slate-400" /> : <Minimize2 className="w-4 h-4 text-slate-400" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4 text-slate-400" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="h-72 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-cyan-500/20' : 'bg-purple-500/20'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Bot className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-cyan-500/20 text-white rounded-tr-none' 
                      : 'bg-slate-800/50 text-slate-200 rounded-tl-none'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    {msg.actionSuggestion && (
                      <div className="mt-2 p-2 bg-green-500/10 rounded-lg">
                        <p className="text-green-400 text-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {msg.actionSuggestion}
                        </p>
                      </div>
                    )}
                    <p className="text-[10px] text-slate-500 mt-1">
                      {msg.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-2xl rounded-tl-none">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Questions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2">
              <p className="text-slate-400 text-xs mb-2">أسئلة سريعة:</p>
              <div className="flex flex-wrap gap-1">
                {quickQuestions.map((q, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant="outline"
                    className="text-xs border-slate-700 text-slate-300 h-7"
                    onClick={() => handleQuickQuestion(q.text)}
                  >
                    <q.icon className="w-3 h-3 ml-1" />
                    {q.text}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اكتب سؤالك هنا..."
                className="bg-slate-800/50 border-slate-700 text-white"
              />
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || isTyping}
                className="bg-gradient-to-r from-cyan-500 to-purple-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}