import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  MessageSquare, Send, Bot, User, Sparkles, BookOpen, FileText,
  Lightbulb, Copy, Check, ThumbsUp, ThumbsDown, Loader2, X,
  Minimize2, Maximize2, RefreshCw, History
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const quickActions = [
  { id: 'greeting', label: 'تحية', prompt: 'اقترح تحية مناسبة للعميل' },
  { id: 'policy', label: 'سياسات', prompt: 'ما هي سياسة الإرجاع والاستبدال؟' },
  { id: 'pricing', label: 'أسعار', prompt: 'كيف أشرح خطط الأسعار للعميل؟' },
  { id: 'complaint', label: 'شكوى', prompt: 'كيف أتعامل مع شكوى العميل؟' },
  { id: 'upsell', label: 'بيع إضافي', prompt: 'اقترح طريقة للبيع الإضافي' },
];

export default function AIAgentAssistantChatbot({ customerContext, conversationHistory, onSuggestResponse }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'مرحباً! أنا مساعدك الذكي. يمكنني مساعدتك في الإجابة على الاستفسارات، واقتراح مقالات قاعدة المعرفة، وصياغة الردود. كيف يمكنني مساعدتك؟',
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (userMessage) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مساعد ذكي لوكلاء مركز الاتصال. مهمتك مساعدة الوكيل في:
1. الإجابة على الأسئلة الشائعة
2. اقتراح مقالات من قاعدة المعرفة
3. صياغة ردود مناسبة للعملاء
4. تقديم نصائح للتعامل مع المواقف الصعبة

سياق العميل الحالي:
${customerContext || 'عميل عادي'}

تاريخ المحادثة:
${conversationHistory || 'لا يوجد تاريخ سابق'}

سؤال الوكيل:
${userMessage}

قدم إجابة مفيدة ومختصرة. إذا كان السؤال عن صياغة رد، قدم نص جاهز للاستخدام.`,
        response_json_schema: {
          type: "object",
          properties: {
            answer: { type: "string" },
            suggested_response: { type: "string" },
            knowledge_articles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  summary: { type: "string" }
                }
              }
            },
            tips: { type: "array", items: { type: "string" } },
            confidence: { type: "number" }
          }
        }
      });
      return result;
    },
    onSuccess: (data, variables) => {
      const assistantMessage = {
        id: Date.now(),
        role: 'assistant',
        content: data.answer,
        suggestedResponse: data.suggested_response,
        knowledgeArticles: data.knowledge_articles,
        tips: data.tips,
        confidence: data.confidence,
        time: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: () => {
      toast.error('حدث خطأ في الحصول على الإجابة');
    }
  });

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      time: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(input);
    setInput('');
  };

  const handleQuickAction = (prompt) => {
    setInput(prompt);
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: prompt,
      time: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(prompt);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('تم النسخ');
  };

  const useSuggestedResponse = (response) => {
    onSuggestResponse?.(response);
    toast.success('تم إضافة الرد المقترح');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <Card className={`bg-gradient-to-b from-slate-800/50 to-slate-900/50 border-purple-500/30 h-full flex flex-col ${isMinimized ? 'h-auto' : ''}`}>
        <CardHeader className="pb-2 border-b border-slate-700/50">
          <CardTitle className="text-white text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="p-1.5 rounded-lg bg-purple-500/20"
              >
                <Bot className="w-4 h-4 text-purple-400" />
              </motion.div>
              مساعد AI للوكيل
              <Badge className="bg-green-500/20 text-green-400 text-xs">متصل</Badge>
            </span>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex-1 flex flex-col p-3 overflow-hidden">
            {/* Quick Actions */}
            <div className="flex gap-1 flex-wrap mb-3">
              {quickActions.map(action => (
                <Button
                  key={action.id}
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs border-slate-600 hover:bg-purple-500/20"
                  onClick={() => handleQuickAction(action.prompt)}
                >
                  {action.label}
                </Button>
              ))}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 pr-2" ref={scrollRef}>
              <div className="space-y-3">
                <AnimatePresence>
                  {messages.map(message => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[90%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className={`p-3 rounded-lg ${
                          message.role === 'user' 
                            ? 'bg-slate-700/50' 
                            : 'bg-purple-500/20 border border-purple-500/30'
                        }`}>
                          <p className="text-white text-sm">{message.content}</p>
                          
                          {/* Suggested Response */}
                          {message.suggestedResponse && (
                            <div className="mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-green-400 text-xs font-medium">رد مقترح:</span>
                                <div className="flex gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-5 w-5"
                                    onClick={() => copyToClipboard(message.suggestedResponse, `resp-${message.id}`)}
                                  >
                                    {copiedId === `resp-${message.id}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-5 text-xs bg-green-600 hover:bg-green-700 px-2"
                                    onClick={() => useSuggestedResponse(message.suggestedResponse)}
                                  >
                                    استخدام
                                  </Button>
                                </div>
                              </div>
                              <p className="text-slate-300 text-xs">{message.suggestedResponse}</p>
                            </div>
                          )}

                          {/* Knowledge Articles */}
                          {message.knowledgeArticles?.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <span className="text-cyan-400 text-xs font-medium flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                مقالات ذات صلة:
                              </span>
                              {message.knowledgeArticles.map((article, i) => (
                                <div key={i} className="p-2 bg-slate-800/50 rounded text-xs">
                                  <p className="text-white font-medium">{article.title}</p>
                                  <p className="text-slate-400 mt-1">{article.summary}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Tips */}
                          {message.tips?.length > 0 && (
                            <div className="mt-3">
                              <span className="text-amber-400 text-xs font-medium flex items-center gap-1">
                                <Lightbulb className="w-3 h-3" />
                                نصائح:
                              </span>
                              <ul className="mt-1 space-y-1">
                                {message.tips.map((tip, i) => (
                                  <li key={i} className="text-slate-300 text-xs flex items-start gap-1">
                                    <span className="text-amber-400">•</span>
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <span className="text-slate-500 text-xs mt-1 block">
                          {message.time.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {chatMutation.isPending && (
                  <div className="flex justify-end">
                    <div className="bg-purple-500/20 border border-purple-500/30 p-3 rounded-lg">
                      <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="mt-3 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="اسأل المساعد..."
                className="bg-slate-800/50 border-slate-700 text-white text-sm"
                disabled={chatMutation.isPending}
              />
              <Button
                size="icon"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={sendMessage}
                disabled={chatMutation.isPending || !input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}