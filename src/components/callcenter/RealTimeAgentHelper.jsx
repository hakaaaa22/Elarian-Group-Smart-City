import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Bot, Sparkles, Copy, ThumbsUp, ThumbsDown, MessageSquare, Lightbulb,
  ChevronRight, AlertTriangle, CheckCircle, Clock, User, History,
  Search, BookOpen, Zap, Send, RotateCw, ArrowRight, Target, Shield,
  Brain, TrendingUp, FileText, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

// Quick Actions for Agent
const quickActions = [
  { id: 'empathy', label: 'تعاطف', template: 'أنا أتفهم إحباطك تماماً، ودعني أساعدك في حل هذه المشكلة فوراً.' },
  { id: 'hold', label: 'انتظار', template: 'هل يمكنك الانتظار لحظة بينما أتحقق من هذا الأمر؟' },
  { id: 'transfer', label: 'تحويل', template: 'سأقوم بتحويلك للقسم المختص الذي سيساعدك بشكل أفضل.' },
  { id: 'confirm', label: 'تأكيد', template: 'دعني أتأكد من فهمي - هل المشكلة هي...' },
  { id: 'apologize', label: 'اعتذار', template: 'أعتذر بشدة عن هذا الإزعاج، سنعمل على حل هذا فوراً.' },
  { id: 'thank', label: 'شكر', template: 'شكراً لصبرك وتفهمك، نقدر تواصلك معنا.' },
];

export default function RealTimeAgentHelper({ 
  customerMessage, 
  customerEmotion = 'neutral',
  customerPersonality = 'standard',
  callContext = null,
  onSuggestResponse 
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [knowledgeResults, setKnowledgeResults] = useState([]);
  const [nextSteps, setNextSteps] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [escalationRisk, setEscalationRisk] = useState(0);

  // AI Response Suggestion
  const generateSuggestionsMutation = useMutation({
    mutationFn: async (message) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مساعد ذكي لموظف مركز اتصال.

رسالة العميل: "${message}"
مشاعر العميل: ${customerEmotion}
نوع شخصية العميل: ${customerPersonality}
${callContext ? `سياق المكالمة: ${JSON.stringify(callContext)}` : ''}

قم بتوفير:
1. 3 ردود مقترحة مناسبة لنبرة العميل
2. خطوات الحل المقترحة
3. معلومات من قاعدة المعرفة ذات صلة
4. مستوى خطورة التصعيد (0-100)
5. نصائح للوكيل`,
        response_json_schema: {
          type: "object",
          properties: {
            suggested_responses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  tone: { type: "string" },
                  confidence: { type: "number" }
                }
              }
            },
            next_steps: { type: "array", items: { type: "string" } },
            knowledge_articles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  summary: { type: "string" },
                  relevance: { type: "number" }
                }
              }
            },
            escalation_risk: { type: "number" },
            agent_tips: { type: "array", items: { type: "string" } },
            customer_intent: { type: "string" },
            recommended_action: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setSuggestions(data.suggested_responses || []);
      setNextSteps(data.next_steps || []);
      setKnowledgeResults(data.knowledge_articles || []);
      setEscalationRisk(data.escalation_risk || 0);
      setIsGenerating(false);
      
      // Add to history
      setHistory(prev => [...prev, {
        id: Date.now(),
        query: customerMessage,
        suggestions: data.suggested_responses?.length || 0,
        time: new Date().toLocaleTimeString('ar-SA'),
      }]);
    },
  });

  // Knowledge Base Search
  const searchKnowledgeMutation = useMutation({
    mutationFn: async (query) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `ابحث في قاعدة المعرفة عن: "${query}"
        
قدم أفضل 5 نتائج ذات صلة مع ملخص لكل منها.`,
        response_json_schema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                  category: { type: "string" },
                  relevance_score: { type: "number" }
                }
              }
            }
          }
        }
      });
    },
    onSuccess: (data) => {
      setKnowledgeResults(data.results || []);
    },
  });

  useEffect(() => {
    if (customerMessage) {
      setIsGenerating(true);
      generateSuggestionsMutation.mutate(customerMessage);
    }
  }, [customerMessage]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('تم نسخ النص');
    onSuggestResponse?.(text);
  };

  const getEmotionColor = () => {
    switch (customerEmotion) {
      case 'angry': return 'red';
      case 'frustrated': return 'orange';
      case 'happy': return 'green';
      case 'confused': return 'amber';
      default: return 'slate';
    }
  };

  const getPersonalityTips = () => {
    switch (customerPersonality) {
      case 'analytical': return 'قدم بيانات وأرقام دقيقة';
      case 'emotional': return 'أظهر التعاطف والاهتمام';
      case 'direct': return 'كن مختصراً ومباشراً';
      case 'aggressive': return 'ابقَ هادئاً ومهنياً';
      default: return 'استخدم أسلوباً متوازناً';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-cyan-500/20">
            <Bot className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">مساعد الوكيل الذكي</h3>
            <p className="text-slate-400 text-sm">Real-time AI Helper</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`bg-${getEmotionColor()}-500/20 text-${getEmotionColor()}-400`}>
            {customerEmotion === 'angry' ? 'غاضب' : 
             customerEmotion === 'frustrated' ? 'محبط' :
             customerEmotion === 'happy' ? 'راضٍ' :
             customerEmotion === 'confused' ? 'مرتبك' : 'محايد'}
          </Badge>
          {escalationRisk > 50 && (
            <Badge className="bg-red-500/20 text-red-400 animate-pulse">
              <AlertTriangle className="w-3 h-3 ml-1" />
              خطر تصعيد {escalationRisk}%
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map(action => (
          <Button
            key={action.id}
            size="sm"
            variant="outline"
            className="border-slate-700 hover:border-cyan-500/50 h-8"
            onClick={() => copyToClipboard(action.template)}
          >
            {action.label}
          </Button>
        ))}
      </div>

      {/* Customer Personality Tip */}
      <Card className={`bg-${getEmotionColor()}-500/10 border-${getEmotionColor()}-500/30`}>
        <CardContent className="p-3 flex items-center gap-3">
          <Lightbulb className={`w-5 h-5 text-${getEmotionColor()}-400`} />
          <div>
            <p className="text-white text-sm font-medium">نصيحة التعامل</p>
            <p className="text-slate-400 text-xs">{getPersonalityTips()}</p>
          </div>
        </CardContent>
      </Card>

      {/* AI Suggested Responses */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            ردود مقترحة
            {isGenerating && <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[180px]">
            {suggestions.length === 0 && !isGenerating ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                سيظهر اقتراحات الردود هنا
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((suggestion, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                        {suggestion.tone || 'عام'}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 text-xs">{suggestion.confidence || 85}%</span>
                      </div>
                    </div>
                    <p className="text-white text-sm mb-2">{suggestion.text}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-cyan-400"
                        onClick={() => copyToClipboard(suggestion.text)}
                      >
                        <Copy className="w-3 h-3 ml-1" />
                        نسخ
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-green-400"
                        onClick={() => { toast.success('تم استخدام الرد'); copyToClipboard(suggestion.text); }}
                      >
                        <Send className="w-3 h-3 ml-1" />
                        استخدام
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Next Steps */}
      {nextSteps.length > 0 && (
        <Card className="bg-green-500/10 border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-400 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              خطوات الحل المقترحة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {nextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">{step}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Knowledge Base Search */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            قاعدة المعرفة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="بحث في قاعدة المعرفة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchKnowledgeMutation.mutate(searchQuery)}
                className="pr-8 bg-slate-900/50 border-slate-700 text-white h-9"
              />
            </div>
            <Button 
              size="sm" 
              className="bg-amber-600 hover:bg-amber-700 h-9"
              onClick={() => searchKnowledgeMutation.mutate(searchQuery)}
              disabled={searchKnowledgeMutation.isPending}
            >
              {searchKnowledgeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          <ScrollArea className="h-[120px]">
            {knowledgeResults.length === 0 ? (
              <div className="text-center py-4 text-slate-500 text-sm">
                ابحث للعثور على مقالات ذات صلة
              </div>
            ) : (
              <div className="space-y-2">
                {knowledgeResults.map((article, i) => (
                  <div key={i} className="p-2 bg-slate-900/30 rounded-lg hover:bg-slate-800/50 cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm font-medium">{article.title}</span>
                      <Badge className="bg-slate-700 text-slate-300 text-xs">{article.category || 'عام'}</Badge>
                    </div>
                    <p className="text-slate-400 text-xs line-clamp-2">{article.summary || article.content}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <History className="w-3 h-3" />
          <span>آخر {history.length} استفسارات</span>
        </div>
      )}
    </div>
  );
}