import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  BookOpen, Search, Upload, FileText, Lightbulb, Brain, RefreshCw,
  ThumbsUp, ThumbsDown, Copy, ExternalLink, Tag, Clock, Star, Plus,
  FolderOpen, Sparkles, MessageSquare, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const knowledgeArticles = [
  { id: 1, title: 'إجراءات الصيانة الطارئة', category: 'صيانة', views: 245, rating: 4.8, tags: ['طوارئ', 'صيانة', 'إجراءات'], content: 'خطوات التعامل مع طلبات الصيانة العاجلة...' },
  { id: 2, title: 'سياسة استرداد المبالغ', category: 'مالية', views: 189, rating: 4.5, tags: ['استرداد', 'مالية', 'سياسات'], content: 'شروط وإجراءات استرداد المبالغ...' },
  { id: 3, title: 'التعامل مع العملاء الغاضبين', category: 'خدمة عملاء', views: 312, rating: 4.9, tags: ['شكاوى', 'تصعيد', 'مهارات'], content: 'أفضل الممارسات للتعامل مع الشكاوى...' },
  { id: 4, title: 'أوقات العمل والعطلات', category: 'عام', views: 156, rating: 4.2, tags: ['مواعيد', 'عطلات', 'عام'], content: 'جدول أوقات العمل الرسمية...' },
  { id: 5, title: 'خطوات تسجيل شكوى رسمية', category: 'شكاوى', views: 278, rating: 4.6, tags: ['شكاوى', 'إجراءات', 'رسمي'], content: 'الإجراءات الرسمية لتسجيل الشكاوى...' },
  { id: 6, title: 'إجراءات التصعيد للمشرف', category: 'إجراءات', views: 198, rating: 4.7, tags: ['تصعيد', 'مشرف', 'إجراءات'], content: 'متى وكيف يتم التصعيد...' },
  { id: 7, title: 'أسعار الخدمات والباقات', category: 'مالية', views: 423, rating: 4.4, tags: ['أسعار', 'باقات', 'خدمات'], content: 'قائمة الأسعار المحدثة...' },
];

const faqs = [
  { q: 'ما هي أوقات العمل؟', a: 'من الأحد إلى الخميس، 8 صباحاً - 5 مساءً' },
  { q: 'كيف أتتبع طلبي؟', a: 'يمكنك تتبع طلبك عبر التطبيق أو الاتصال برقم 920001234' },
  { q: 'ما هي سياسة الإرجاع؟', a: 'يمكن الإرجاع خلال 14 يوم من تاريخ الشراء' },
];

export default function AIKnowledgeBase({ conversationContext, onSuggestResponse }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [newDocument, setNewDocument] = useState({ title: '', content: '', category: '' });
  const [autoSuggestEnabled, setAutoSuggestEnabled] = useState(true);
  const [lastContext, setLastContext] = useState('');

  // Auto-suggest based on conversation context
  useEffect(() => {
    if (autoSuggestEnabled && conversationContext && conversationContext !== lastContext && conversationContext.length > 20) {
      setLastContext(conversationContext);
      const timer = setTimeout(() => {
        proactiveSuggestions.mutate(conversationContext);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [conversationContext, autoSuggestEnabled]);

  // AI Search Query
  const searchMutation = useMutation({
    mutationFn: async (query) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في قاعدة المعرفة، ابحث في المقالات التالية عن إجابة للسؤال:

السؤال: ${query}

المقالات المتاحة:
${knowledgeArticles.map(a => `- ${a.title} (${a.category}): ${a.tags.join(', ')}`).join('\n')}

الأسئلة الشائعة:
${faqs.map(f => `س: ${f.q} - ج: ${f.a}`).join('\n')}

قدم:
1. أفضل 3 مقالات مطابقة مع سبب الاختيار
2. إجابة مباشرة ومختصرة إن وجدت
3. اقتراحات لتحسين البحث`,
        response_json_schema: {
          type: "object",
          properties: {
            matchedArticles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  relevance: { type: "number" },
                  reason: { type: "string" }
                }
              }
            },
            directAnswer: { type: "string" },
            searchSuggestions: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setSuggestions(data.matchedArticles || []);
      if (data.directAnswer) {
        toast.success('تم العثور على إجابة مباشرة');
      }
    }
  });

  // Proactive Suggestions based on conversation
  const proactiveSuggestions = useMutation({
    mutationFn: async (context) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في خدمة العملاء، حلل سياق المحادثة واقترح مقالات ذات صلة وردود مقترحة:

سياق المحادثة: ${context || 'استفسار عام'}

المقالات المتاحة:
${knowledgeArticles.map(a => `- ${a.id}: ${a.title} (${a.category}) - ${a.tags.join(', ')}`).join('\n')}

الأسئلة الشائعة:
${faqs.map(f => `س: ${f.q}`).join('\n')}

قدم:
1. أفضل 3 مقالات مطابقة مع سبب الاقتراح ونقاط رئيسية
2. ردود مقترحة للوكيل بناءً على السياق
3. كلمات مفتاحية مستخرجة من المحادثة`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  articleId: { type: "number" },
                  reason: { type: "string" },
                  keyPoints: { type: "array", items: { type: "string" } },
                  relevanceScore: { type: "number" }
                }
              }
            },
            suggestedResponses: { type: "array", items: { type: "string" } },
            extractedKeywords: { type: "array", items: { type: "string" } },
            detectedIntent: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setSuggestions(data.suggestions || []);
      if (data.suggestedResponses?.length > 0 && onSuggestResponse) {
        onSuggestResponse(data.suggestedResponses);
      }
    }
  });

  // Ingest new document
  const ingestDocument = useMutation({
    mutationFn: async (doc) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل وفهرسة المستند التالي:

العنوان: ${doc.title}
المحتوى: ${doc.content}
التصنيف: ${doc.category}

استخرج:
1. الكلمات المفتاحية
2. ملخص قصير
3. الأسئلة التي يجيب عليها المستند
4. المقالات ذات الصلة`,
        response_json_schema: {
          type: "object",
          properties: {
            keywords: { type: "array", items: { type: "string" } },
            summary: { type: "string" },
            answeredQuestions: { type: "array", items: { type: "string" } },
            relatedArticles: { type: "array", items: { type: "number" } }
          }
        }
      });
    },
    onSuccess: () => {
      toast.success('تم إضافة المستند لقاعدة المعرفة');
      setShowUploadDialog(false);
      setNewDocument({ title: '', content: '', category: '' });
    }
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchMutation.mutate(searchQuery);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ');
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          قاعدة المعرفة الذكية
        </h3>
        <Button size="sm" variant="outline" className="border-blue-500/50 text-blue-400" onClick={() => setShowUploadDialog(true)}>
          <Plus className="w-4 h-4 ml-1" />
          إضافة مستند
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="ابحث في قاعدة المعرفة..."
                className="pr-10 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSearch} disabled={searchMutation.isPending}>
              {searchMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            </Button>
          </div>

          {/* Direct Answer */}
          {searchMutation.data?.directAnswer && (
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">إجابة مباشرة</span>
                </div>
                <Button size="sm" variant="ghost" className="h-6" onClick={() => copyToClipboard(searchMutation.data.directAnswer)}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-white text-sm">{searchMutation.data.directAnswer}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proactive Suggestions */}
      <Card className="bg-purple-500/10 border-purple-500/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              اقتراحات ذكية استباقية
              {proactiveSuggestions.isPending && <RefreshCw className="w-3 h-3 animate-spin text-purple-400" />}
            </CardTitle>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-xs text-slate-400">
                <input 
                  type="checkbox" 
                  checked={autoSuggestEnabled} 
                  onChange={(e) => setAutoSuggestEnabled(e.target.checked)}
                  className="w-3 h-3"
                />
                تلقائي
              </label>
              <Button size="sm" variant="ghost" className="h-6 text-purple-400" onClick={() => proactiveSuggestions.mutate(conversationContext)}>
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {suggestions.length > 0 ? (
            <div className="space-y-2">
              {suggestions.map((sug, i) => {
                const article = knowledgeArticles.find(a => a.id === (sug.articleId || sug.id));
                if (!article) return null;
                return (
                  <div key={i} className="p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-all" onClick={() => setSelectedArticle(article)}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white font-medium text-sm">{article.title}</p>
                      <div className="flex items-center gap-1">
                        {sug.relevanceScore && <Badge className="bg-green-500/20 text-green-400 text-xs">{sug.relevanceScore}%</Badge>}
                        <Badge className="bg-purple-500/20 text-purple-400 text-xs">{article.category}</Badge>
                      </div>
                    </div>
                    <p className="text-slate-400 text-xs mb-2">{sug.reason}</p>
                    {sug.keyPoints?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {sug.keyPoints.slice(0, 3).map((point, j) => (
                          <Badge key={j} className="bg-slate-700 text-slate-300 text-xs">{point}</Badge>
                        ))}
                      </div>
                    )}
                    <Button size="sm" variant="ghost" className="h-6 mt-2 text-cyan-400" onClick={(e) => { e.stopPropagation(); copyToClipboard(article.content || article.title); }}>
                      <Copy className="w-3 h-3 ml-1" />
                      نسخ للرد
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4">
              <Lightbulb className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">الاقتراحات ستظهر تلقائياً بناءً على المحادثة</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Knowledge Articles */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">المقالات الشائعة</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {knowledgeArticles.map(article => (
                <div key={article.id} className="p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50" onClick={() => setSelectedArticle(article)}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white text-sm">{article.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 text-xs flex items-center gap-1">
                        <Star className="w-3 h-3" />{article.rating}
                      </span>
                      <Badge className="bg-slate-700 text-slate-300 text-xs">{article.category}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {article.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} className="bg-slate-700/50 text-slate-400 text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">الأسئلة الشائعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="p-3 bg-slate-800/30 rounded-lg">
                <p className="text-cyan-400 text-sm mb-1">{faq.q}</p>
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm">{faq.a}</p>
                  <Button size="sm" variant="ghost" className="h-6" onClick={() => copyToClipboard(faq.a)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-400" />
              إضافة مستند جديد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              value={newDocument.title}
              onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
              placeholder="عنوان المستند"
              className="bg-slate-800/50 border-slate-700 text-white"
            />
            <Input
              value={newDocument.category}
              onChange={(e) => setNewDocument({...newDocument, category: e.target.value})}
              placeholder="التصنيف"
              className="bg-slate-800/50 border-slate-700 text-white"
            />
            <Textarea
              value={newDocument.content}
              onChange={(e) => setNewDocument({...newDocument, content: e.target.value})}
              placeholder="محتوى المستند..."
              className="bg-slate-800/50 border-slate-700 text-white h-32"
            />
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => ingestDocument.mutate(newDocument)} disabled={ingestDocument.isPending}>
              {ingestDocument.isPending ? <RefreshCw className="w-4 h-4 ml-1 animate-spin" /> : <Brain className="w-4 h-4 ml-1" />}
              تحليل وإضافة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}