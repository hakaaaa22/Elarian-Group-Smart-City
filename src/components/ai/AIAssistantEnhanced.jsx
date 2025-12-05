import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  MessageSquare, Send, Bot, Sparkles, Brain, Loader2, History, Trash2,
  Copy, ThumbsUp, ThumbsDown, User, RefreshCw, Lightbulb, Target, Zap,
  FileText, BarChart3, Search, Settings, Eye, CheckCircle, X, Mic
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

// Context-aware actions
const suggestedActions = [
  { id: 'analyze', label: 'تحليل البيانات', icon: BarChart3, prompt: 'قم بتحليل البيانات الحالية وتقديم رؤى' },
  { id: 'predict', label: 'التنبؤ', icon: Target, prompt: 'ما هي التوقعات للأيام القادمة؟' },
  { id: 'optimize', label: 'تحسين', icon: Zap, prompt: 'كيف يمكن تحسين الأداء؟' },
  { id: 'report', label: 'إنشاء تقرير', icon: FileText, prompt: 'أنشئ تقريراً شاملاً' },
];

export default function AIAssistantEnhanced({ context = {}, onActionExecute }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'مرحباً! أنا مساعدك الذكي. يمكنني مساعدتك في تحليل البيانات، إنشاء التقارير، التنبؤ بالاتجاهات، والإجابة على استفساراتك. كيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // AI Response Mutation
  const aiResponseMutation = useMutation({
    mutationFn: async (userMessage) => {
      setIsTyping(true);
      
      // Build context from app state
      const contextPrompt = Object.keys(context).length > 0 
        ? `\n\nالسياق الحالي للمستخدم:\n${JSON.stringify(context, null, 2)}`
        : '';

      const conversationHistory = messages
        .slice(-5)
        .map(m => `${m.role === 'user' ? 'المستخدم' : 'المساعد'}: ${m.content}`)
        .join('\n');

      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مساعد ذكي متقدم لنظام إدارة متكامل يشمل:
- إدارة الأسطول والمركبات
- إدارة الزوار والتصاريح
- الأمن والكاميرات
- الصيانة والأصول
- التقارير والتحليلات

المحادثة السابقة:
${conversationHistory}

${contextPrompt}

رسالة المستخدم الجديدة: "${userMessage}"

قدم إجابة شاملة ومفيدة. إذا كان السؤال يتطلب بيانات محددة، اقترح الخطوات التالية. كن موجزاً ومباشراً.`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            suggested_actions: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  action: { type: "string" },
                  description: { type: "string" }
                }
              } 
            },
            insights: { type: "array", items: { type: "string" } },
            confidence: { type: "number" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: data.response,
        suggestedActions: data.suggested_actions,
        insights: data.insights,
        confidence: data.confidence,
        timestamp: new Date().toISOString(),
      }]);
    },
    onError: () => {
      setIsTyping(false);
      toast.error('حدث خطأ في الاتصال بالمساعد الذكي');
    }
  });

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    aiResponseMutation.mutate(input.trim());
    setInput('');
  };

  const useAction = (action) => {
    setInput(action.prompt);
    sendMessage();
  };

  const clearHistory = () => {
    setMessages([{
      id: 1,
      role: 'assistant',
      content: 'تم مسح السجل. كيف يمكنني مساعدتك؟',
      timestamp: new Date().toISOString(),
    }]);
    toast.success('تم مسح السجل');
  };

  return (
    <div className="h-full flex flex-col" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Bot className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">المساعد الذكي</h3>
            <p className="text-slate-400 text-xs">AI Assistant</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" className="h-8" onClick={clearHistory}>
            <Trash2 className="w-3 h-3 text-red-400" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {suggestedActions.map(action => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              size="sm"
              variant="outline"
              className="border-slate-700 hover:border-purple-500/50 h-8"
              onClick={() => useAction(action)}
            >
              <Icon className="w-3 h-3 ml-1" />
              {action.label}
            </Button>
          );
        })}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 mb-4 pr-4">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-purple-500/20 text-purple-400">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-cyan-500/20 text-white rounded-br-none'
                      : 'bg-slate-800/50 text-white rounded-bl-none'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  
                  {/* Suggested Actions from AI */}
                  {msg.suggestedActions?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.suggestedActions.map((action, i) => (
                        <div key={i} className="p-2 bg-slate-900/50 rounded-lg text-xs">
                          <p className="text-purple-400 font-medium">{action.action}</p>
                          <p className="text-slate-400">{action.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Insights */}
                  {msg.insights?.length > 0 && (
                    <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <Lightbulb className="w-3 h-3 text-amber-400" />
                        <span className="text-amber-400 text-xs font-medium">رؤى</span>
                      </div>
                      <ul className="space-y-1">
                        {msg.insights.map((insight, i) => (
                          <li key={i} className="text-slate-300 text-xs flex items-start gap-1">
                            <span>•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-500 text-[10px]">
                      {new Date(msg.timestamp).toLocaleTimeString('ar-SA')}
                    </span>
                    {msg.role === 'assistant' && msg.confidence && (
                      <Badge className="bg-slate-700 text-slate-400 text-[10px]">
                        {msg.confidence}% ثقة
                      </Badge>
                    )}
                  </div>
                </div>
                {msg.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-cyan-500/20 text-cyan-400">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-purple-500/20 text-purple-400">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="p-3 bg-slate-800/50 rounded-2xl rounded-bl-none">
                <div className="flex gap-1">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-purple-400 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-purple-400 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-purple-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-slate-700 pt-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="اسأل المساعد الذكي..."
            className="bg-slate-800/50 border-slate-700 text-white resize-none"
            rows={2}
          />
          <Button
            className="bg-purple-600 hover:bg-purple-700 h-auto px-4"
            onClick={sendMessage}
            disabled={!input.trim() || aiResponseMutation.isPending}
          >
            {aiResponseMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}