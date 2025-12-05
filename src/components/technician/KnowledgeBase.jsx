import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Book, Wrench, Lightbulb, ChevronRight, Star,
  ThumbsUp, ThumbsDown, Clock, Eye, Filter, Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const knowledgeArticles = [
  {
    id: 1,
    title: 'إصلاح مشكلة تسريب المكيف',
    category: 'تكييف',
    problem: 'تسريب مياه من الوحدة الداخلية',
    solution: `1. تحقق من أنبوب الصرف وتأكد من عدم انسداده
2. نظف الفلتر إذا كان متسخاً
3. تأكد من استواء الوحدة الداخلية
4. افحص مستوى الفريون`,
    steps: [
      'أوقف تشغيل المكيف',
      'افحص أنبوب الصرف من الخارج',
      'استخدم ضاغط هواء لتنظيف الأنبوب',
      'أعد تشغيل المكيف وراقب لمدة 30 دقيقة'
    ],
    tools: ['مفك', 'ضاغط هواء', 'ميزان مياه'],
    timeEstimate: 30,
    difficulty: 'سهل',
    views: 245,
    helpful: 89,
    tags: ['تسريب', 'صيانة', 'مكيف سبليت']
  },
  {
    id: 2,
    title: 'إعادة ضبط كاميرا IP',
    category: 'كاميرات',
    problem: 'الكاميرا لا تتصل بالشبكة',
    solution: `1. تحقق من كابل الشبكة
2. أعد تشغيل الكاميرا
3. تحقق من إعدادات IP
4. أعد ضبط المصنع إذا لزم الأمر`,
    steps: [
      'افصل الكاميرا عن الكهرباء',
      'اضغط على زر Reset لمدة 10 ثواني',
      'أعد توصيل الكهرباء',
      'استخدم تطبيق الشركة للبحث عن الكاميرا',
      'أعد إدخال بيانات الشبكة'
    ],
    tools: ['لابتوب', 'كابل شبكة', 'دبوس إعادة ضبط'],
    timeEstimate: 20,
    difficulty: 'متوسط',
    views: 178,
    helpful: 72,
    tags: ['اتصال', 'شبكة', 'IP']
  },
  {
    id: 3,
    title: 'استبدال بطارية حساس الحركة',
    category: 'أمن',
    problem: 'حساس الحركة لا يعمل أو يعطي إنذارات خاطئة',
    solution: `1. افتح غطاء الحساس
2. استبدل البطارية
3. أعد معايرة الحساس
4. اختبر الحساس`,
    steps: [
      'أوقف نظام الإنذار',
      'افتح غطاء الحساس بالمفك',
      'أزل البطارية القديمة',
      'ركب البطارية الجديدة (انتبه للقطبية)',
      'أغلق الغطاء',
      'فعّل النظام واختبر الحساس'
    ],
    tools: ['مفك صغير', 'بطارية CR123A'],
    timeEstimate: 10,
    difficulty: 'سهل',
    views: 312,
    helpful: 95,
    tags: ['بطارية', 'حساس', 'إنذار']
  },
  {
    id: 4,
    title: 'معايرة ترموستات المكيف',
    category: 'تكييف',
    problem: 'المكيف لا يحافظ على درجة الحرارة المطلوبة',
    solution: `1. تحقق من موقع الترموستات
2. نظف الترموستات
3. أعد المعايرة
4. اختبر الأداء`,
    steps: [
      'استخدم ميزان حرارة دقيق لقياس الغرفة',
      'قارن مع قراءة الترموستات',
      'اضبط المعايرة من إعدادات الجهاز',
      'انتظر 15 دقيقة وأعد القياس'
    ],
    tools: ['ميزان حرارة رقمي', 'مفك'],
    timeEstimate: 25,
    difficulty: 'متوسط',
    views: 156,
    helpful: 68,
    tags: ['ترموستات', 'حرارة', 'معايرة']
  }
];

export default function KnowledgeBase({ onSelectSolution }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [aiSolution, setAiSolution] = useState(null);

  const categories = ['all', 'تكييف', 'كاميرات', 'أمن', 'كهرباء'];

  const aiSearchMutation = useMutation({
    mutationFn: async (query) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت فني صيانة خبير. المشكلة: "${query}"

قدم حلاً تقنياً مفصلاً يشمل:
1. تشخيص المشكلة المحتملة
2. خطوات الإصلاح بالترتيب
3. الأدوات المطلوبة
4. تحذيرات السلامة
5. الوقت المقدر للإصلاح`,
        response_json_schema: {
          type: "object",
          properties: {
            diagnosis: { type: "string" },
            steps: { type: "array", items: { type: "string" } },
            tools: { type: "array", items: { type: "string" } },
            warnings: { type: "array", items: { type: "string" } },
            estimatedTime: { type: "number" },
            confidence: { type: "number" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAiSolution(data);
      setIsSearchingAI(false);
    },
    onError: () => {
      toast.error('فشل البحث');
      setIsSearchingAI(false);
    }
  });

  const filteredArticles = knowledgeArticles.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.includes(searchQuery) || 
      article.problem.includes(searchQuery) ||
      article.tags.some(tag => tag.includes(searchQuery));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAISearch = () => {
    if (!searchQuery.trim()) {
      toast.error('أدخل وصف المشكلة');
      return;
    }
    setIsSearchingAI(true);
    setAiSolution(null);
    aiSearchMutation.mutate(searchQuery);
  };

  const difficultyColors = {
    'سهل': 'bg-green-500/20 text-green-400',
    'متوسط': 'bg-amber-500/20 text-amber-400',
    'صعب': 'bg-red-500/20 text-red-400'
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="ابحث عن مشكلة أو حل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleAISearch}
              disabled={isSearchingAI}
            >
              <Zap className="w-4 h-4 ml-1" />
              AI
            </Button>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {categories.map(cat => (
              <Button
                key={cat}
                size="sm"
                variant={selectedCategory === cat ? "default" : "outline"}
                className={selectedCategory === cat ? "bg-cyan-600" : "border-slate-600"}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'all' ? 'الكل' : cat}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Solution */}
      {isSearchingAI && (
        <Card className="glass-card border-purple-500/30 bg-purple-500/5">
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 text-purple-400 mx-auto animate-pulse mb-2" />
            <p className="text-slate-400">جاري البحث بالذكاء الاصطناعي...</p>
          </CardContent>
        </Card>
      )}

      {aiSolution && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card border-purple-500/30 bg-purple-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="text-purple-300 font-medium">حل AI</span>
                <Badge className="bg-purple-500/20 text-purple-400">
                  دقة: {aiSolution.confidence}%
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-white text-sm font-medium mb-1">التشخيص:</h4>
                  <p className="text-slate-300 text-sm">{aiSolution.diagnosis}</p>
                </div>

                <div>
                  <h4 className="text-white text-sm font-medium mb-1">خطوات الإصلاح:</h4>
                  <ol className="space-y-1">
                    {aiSolution.steps?.map((step, i) => (
                      <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                {aiSolution.warnings?.length > 0 && (
                  <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded">
                    <h4 className="text-amber-400 text-xs font-medium mb-1">تحذيرات:</h4>
                    {aiSolution.warnings.map((w, i) => (
                      <p key={i} className="text-amber-300 text-xs">⚠️ {w}</p>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span><Clock className="w-3 h-3 inline" /> {aiSolution.estimatedTime} دقيقة</span>
                  <span><Wrench className="w-3 h-3 inline" /> {aiSolution.tools?.join('، ')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Articles */}
      <div className="space-y-3">
        {filteredArticles.map(article => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card 
              className="glass-card border-indigo-500/20 bg-[#0f1629]/80 cursor-pointer hover:border-cyan-500/50 transition-colors"
              onClick={() => setSelectedArticle(article)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Book className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-white font-bold">{article.title}</h3>
                    </div>
                    <p className="text-slate-400 text-sm">{article.problem}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge className="bg-slate-500/20 text-slate-400 text-xs">
                        {article.category}
                      </Badge>
                      <Badge className={`text-xs ${difficultyColors[article.difficulty]}`}>
                        {article.difficulty}
                      </Badge>
                      <span className="text-slate-500 text-xs flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {article.views}
                      </span>
                      <span className="text-green-400 text-xs flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> {article.helpful}%
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Article Detail Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Book className="w-5 h-5 text-cyan-400" />
              {selectedArticle?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedArticle && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-amber-400 text-sm font-medium">المشكلة:</p>
                <p className="text-white text-sm">{selectedArticle.problem}</p>
              </div>

              <div>
                <p className="text-slate-300 text-sm font-medium mb-2">الحل:</p>
                <p className="text-slate-400 text-sm whitespace-pre-line">{selectedArticle.solution}</p>
              </div>

              <div>
                <p className="text-slate-300 text-sm font-medium mb-2">خطوات التنفيذ:</p>
                <ol className="space-y-2">
                  {selectedArticle.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-400 text-sm">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs flex-shrink-0">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-400">
                  <Wrench className="w-4 h-4 inline ml-1" />
                  الأدوات: {selectedArticle.tools.join('، ')}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-400">
                  <Clock className="w-4 h-4 inline ml-1" />
                  الوقت: {selectedArticle.timeEstimate} دقيقة
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    onSelectSolution?.(selectedArticle);
                    setSelectedArticle(null);
                    toast.success('تم تطبيق الحل على المهمة');
                  }}
                >
                  <Lightbulb className="w-4 h-4 ml-2" />
                  استخدام هذا الحل
                </Button>
              </div>

              <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-700">
                <Button size="sm" variant="ghost" className="text-green-400">
                  <ThumbsUp className="w-4 h-4 ml-1" /> مفيد
                </Button>
                <Button size="sm" variant="ghost" className="text-red-400">
                  <ThumbsDown className="w-4 h-4 ml-1" /> غير مفيد
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}