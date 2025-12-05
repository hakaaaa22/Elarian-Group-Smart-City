import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, X, Send, Bot, User, Sparkles, Package,
  Wrench, Truck, HelpCircle, Clock, CheckCircle, Loader2,
  Minimize2, Maximize2, Book, Brain, BarChart3, AlertTriangle,
  TrendingUp, Activity, FileText, Zap, Settings, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const quickQuestions = [
  { icon: Package, text: 'ما هي حالة المخزون الحالية؟', category: 'inventory' },
  { icon: Wrench, text: 'اشرح لي تنبؤات الصيانة', category: 'maintenance' },
  { icon: Truck, text: 'أداء الموردين هذا الشهر', category: 'suppliers' },
  { icon: BarChart3, text: 'تحليل دورة حياة الأصول', category: 'analytics' },
  { icon: AlertTriangle, text: 'التنبيهات والمخاطر الحالية', category: 'alerts' },
  { icon: Brain, text: 'توصيات AI للتحسين', category: 'ai' },
];

const topicCategories = [
  { id: 'inventory', name: 'المخزون', icon: Package, color: 'cyan' },
  { id: 'maintenance', name: 'الصيانة', icon: Wrench, color: 'amber' },
  { id: 'suppliers', name: 'الموردين', icon: Truck, color: 'green' },
  { id: 'analytics', name: 'التحليلات', icon: BarChart3, color: 'purple' },
  { id: 'technicians', name: 'الفنيين', icon: User, color: 'blue' },
  { id: 'reports', name: 'التقارير', icon: FileText, color: 'pink' },
];

const enhancedKnowledgeBase = {
  inventory: {
    keywords: ['مخزون', 'قطع', 'صنف', 'إضافة', 'كمية', 'نقص', 'طلب', 'قطعة', 'متوفر', 'نفذ'],
    responses: [
      'لإضافة صنف جديد للمخزون: اذهب إلى إدارة المخزون > اضغط "إضافة قطعة" > أدخل البيانات المطلوبة.',
      'يمكنك تتبع مستويات المخزون من لوحة التحكم الرئيسية أو من صفحة إدارة المخزون.',
      'عند انخفاض المخزون عن الحد الأدنى، ستظهر تنبيهات تلقائية.',
      'نظام AI يحلل أنماط الاستخدام ويقترح مستويات إعادة الطلب المثالية.',
    ],
    deepInsights: true
  },
  maintenance: {
    keywords: ['صيانة', 'جدولة', 'فني', 'إصلاح', 'عطل', 'مهمة', 'تنبؤ', 'وقائية', 'تصحيحية', 'طارئة'],
    responses: [
      'لجدولة صيانة: اذهب إلى الصيانة > اضغط "صيانة جديدة" > حدد الجهاز والتاريخ والفني.',
      'الصيانة التنبؤية تستخدم AI لتحليل بيانات الأجهزة والتنبؤ بالأعطال قبل حدوثها.',
      'يمكنك عرض تقارير الصيانة المفصلة من تبويب "التقارير" في صفحة الصيانة.',
    ],
    deepInsights: true
  },
  suppliers: {
    keywords: ['مورد', 'عرض سعر', 'طلب', 'شراء', 'RFQ', 'تقييم', 'أداء'],
    responses: [
      'لطلب عرض سعر: اذهب إلى إدارة الموردين > طلبات العروض > طلب جديد.',
      'يمكنك مقارنة عروض الموردين واختيار الأفضل من نفس الصفحة.',
      'تقييم الموردين يتم تلقائياً بناءً على الجودة والتسليم والسعر.',
    ],
    deepInsights: true
  },
  technicians: {
    keywords: ['فني', 'تطبيق', 'موبايل', 'مهام', 'تقرير', 'أداء', 'جدول'],
    responses: [
      'الفنيون يستخدمون تطبيق الهاتف لاستلام المهام وإرسال التقارير.',
      'يمكن للفني تحديث حالة المهمة وإرفاق صور مباشرة من التطبيق.',
      'لمراجعة أداء الفنيين: اذهب إلى التقارير المتقدمة > أداء الفنيين.',
    ],
    deepInsights: false
  },
  analytics: {
    keywords: ['تحليل', 'تنبؤ', 'رؤى', 'اتجاه', 'إحصائيات', 'KPI', 'مؤشر', 'دورة حياة'],
    responses: [
      'تحليلات AI تقدم رؤى معمقة حول أداء الأصول ودورة حياتها.',
      'يمكنك عرض مؤشرات الأداء الرئيسية (KPIs) من لوحة تحكم الصيانة.',
      'التقارير التنبؤية تساعد في التخطيط المستقبلي وتقليل التكاليف.',
    ],
    deepInsights: true
  },
  reports: {
    keywords: ['تقرير', 'تصدير', 'PDF', 'Excel', 'طباعة'],
    responses: [
      'يمكنك إنشاء تقارير مخصصة من صفحة منشئ التقارير.',
      'جميع التقارير قابلة للتصدير بصيغة PDF أو Excel.',
      'التقارير المجدولة يمكن إرسالها تلقائياً عبر البريد الإلكتروني.',
    ],
    deepInsights: false
  }
};

export default function EnhancedAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'مرحباً! أنا مساعدك الذكي المتقدم. يمكنني مساعدتك في فهم تحليلات AI، تقارير الصيانة التنبؤية، بيانات المخزون، وأي استفسارات أخرى. كيف يمكنني مساعدتك؟',
      timestamp: new Date(),
      type: 'greeting'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Deep AI Analysis Mutation
  const deepAnalysisMutation = useMutation({
    mutationFn: async ({ question, topic }) => {
      const contextInfo = topic ? `
السياق: المستخدم يسأل عن موضوع "${topicCategories.find(t => t.id === topic)?.name || 'عام'}"

قاعدة المعرفة المتقدمة:
- المخزون: تتبع القطع، نقاط إعادة الطلب، التنبؤ بالاحتياجات، ربط القطع بالأجهزة
- الصيانة التنبؤية: تحليل بيانات الأجهزة، التنبؤ بالأعطال، جدولة استباقية، تحليل دورة الحياة
- الموردين: تقييم الأداء، مقارنة العروض، تتبع الطلبات، إدارة العقود
- التحليلات: مؤشرات KPI، اتجاهات الاستخدام، تكاليف الصيانة، كفاءة الفنيين
- التقارير: إنشاء تقارير مخصصة، تصدير PDF/Excel، رؤى AI تلقائية` : '';

      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مساعد ذكي متقدم لنظام إدارة المرافق والصيانة. أجب بتفصيل ووضوح باللغة العربية.
${contextInfo}

السؤال: ${question}

قدم إجابة شاملة تشمل:
1. الإجابة المباشرة على السؤال
2. شرح تفصيلي إذا كان السؤال يتعلق بتحليلات أو تنبؤات
3. توصيات عملية
4. روابط للصفحات ذات الصلة في النظام`,
        response_json_schema: {
          type: "object",
          properties: {
            answer: { type: "string" },
            details: { type: "string" },
            recommendations: { 
              type: "array", 
              items: { type: "string" } 
            },
            relatedPages: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" }
                }
              } 
            },
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  value: { type: "string" },
                  trend: { type: "string" }
                }
              }
            },
            actionItems: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
    },
    onSuccess: (data) => {
      const response = {
        id: Date.now(),
        role: 'assistant',
        content: data.answer,
        details: data.details,
        recommendations: data.recommendations,
        relatedPages: data.relatedPages,
        insights: data.insights,
        actionItems: data.actionItems,
        timestamp: new Date(),
        type: 'deep_analysis'
      };
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    },
    onError: () => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: 'عذراً، حدث خطأ في التحليل. يرجى المحاولة مرة أخرى.',
        timestamp: new Date(),
        type: 'error'
      }]);
      setIsTyping(false);
    }
  });

  const findLocalAnswer = (question) => {
    const lowerQ = question.toLowerCase();
    for (const [category, data] of Object.entries(enhancedKnowledgeBase)) {
      if (data.keywords.some(kw => lowerQ.includes(kw))) {
        return {
          answer: data.responses[Math.floor(Math.random() * data.responses.length)],
          needsDeepAnalysis: data.deepInsights && (
            lowerQ.includes('اشرح') || 
            lowerQ.includes('تفصيل') || 
            lowerQ.includes('تحليل') ||
            lowerQ.includes('لماذا') ||
            lowerQ.includes('كيف يعمل')
          ),
          category
        };
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
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    const localResult = findLocalAnswer(currentInput);
    
    if (localResult && !localResult.needsDeepAnalysis) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: localResult.answer,
          timestamp: new Date(),
          type: 'quick'
        }]);
        setIsTyping(false);
      }, 500);
    } else {
      deepAnalysisMutation.mutate({ 
        question: currentInput, 
        topic: localResult?.category || selectedTopic 
      });
    }
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
    setTimeout(() => {
      const fakeEvent = { key: 'Enter' };
      handleSend();
    }, 100);
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
        width: isExpanded ? '600px' : '400px',
        height: isMinimized ? 'auto' : isExpanded ? '700px' : '550px'
      }}
      className="fixed bottom-6 left-6 z-50 bg-[#0f1629] border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">المساعد الذكي المتقدم</h3>
            <p className="text-slate-400 text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              متصل • تحليلات AI مفعّلة
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <Maximize2 className="w-4 h-4 text-slate-400" />}
          </Button>
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
          {/* Topic Filter */}
          <div className="px-4 py-2 border-b border-slate-700/50 overflow-x-auto">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={selectedTopic === null ? "default" : "ghost"}
                className={`text-xs whitespace-nowrap ${selectedTopic === null ? 'bg-purple-600' : ''}`}
                onClick={() => setSelectedTopic(null)}
              >
                الكل
              </Button>
              {topicCategories.map(topic => (
                <Button
                  key={topic.id}
                  size="sm"
                  variant={selectedTopic === topic.id ? "default" : "ghost"}
                  className={`text-xs whitespace-nowrap ${selectedTopic === topic.id ? `bg-${topic.color}-600` : ''}`}
                  onClick={() => setSelectedTopic(topic.id)}
                >
                  <topic.icon className="w-3 h-3 ml-1" />
                  {topic.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className={isExpanded ? "h-[480px]" : "h-72"}>
            <div className="p-4 space-y-4">
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
                      <Brain className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                  <div className={`max-w-[85%] ${msg.role === 'user' ? '' : ''}`}>
                    <div className={`p-3 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-cyan-500/20 text-white rounded-tr-none' 
                        : 'bg-slate-800/50 text-slate-200 rounded-tl-none'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      
                      {/* Deep Analysis Details */}
                      {msg.type === 'deep_analysis' && (
                        <div className="mt-3 space-y-3">
                          {msg.details && (
                            <div className="p-2 bg-slate-700/30 rounded-lg">
                              <p className="text-slate-300 text-xs">{msg.details}</p>
                            </div>
                          )}
                          
                          {msg.insights?.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                              {msg.insights.slice(0, 4).map((insight, i) => (
                                <div key={i} className="p-2 bg-purple-500/10 rounded-lg">
                                  <p className="text-purple-300 text-xs font-medium">{insight.title}</p>
                                  <p className="text-white text-sm font-bold">{insight.value}</p>
                                  {insight.trend && (
                                    <p className={`text-xs flex items-center gap-1 ${
                                      insight.trend === 'up' ? 'text-green-400' : 
                                      insight.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                                    }`}>
                                      {insight.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : 
                                       insight.trend === 'down' ? <Activity className="w-3 h-3" /> : null}
                                      {insight.trend}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {msg.recommendations?.length > 0 && (
                            <div className="p-2 bg-green-500/10 rounded-lg">
                              <p className="text-green-400 text-xs font-medium mb-1 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                توصيات
                              </p>
                              <ul className="text-xs text-slate-300 space-y-1">
                                {msg.recommendations.slice(0, 3).map((rec, i) => (
                                  <li key={i} className="flex items-start gap-1">
                                    <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {msg.actionItems?.length > 0 && (
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                              <p className="text-amber-400 text-xs font-medium mb-1 flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                إجراءات مقترحة
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {msg.actionItems.slice(0, 3).map((action, i) => (
                                  <Badge key={i} className="bg-amber-500/20 text-amber-300 text-xs">
                                    {action}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 px-1">
                      {msg.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-2xl rounded-tl-none">
                    <div className="flex gap-1 items-center">
                      <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                      <span className="text-slate-400 text-xs">جاري التحليل...</span>
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
                placeholder="اسأل عن التحليلات، التنبؤات، أو أي شيء آخر..."
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