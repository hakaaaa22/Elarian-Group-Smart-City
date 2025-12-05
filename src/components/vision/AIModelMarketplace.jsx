import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Store, Search, Star, Download, TrendingUp, Users, Filter, Heart,
  ShoppingCart, Sparkles, Eye, Brain, Shield, Car, Clock, CheckCircle,
  Share2, DollarSign, Tag, BarChart3, Loader2, RefreshCw, Plus, Crown,
  ThumbsUp, MessageSquare, GitBranch, Zap, Award, Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import AIMonetizationEngine from './AIMonetizationEngine';

const marketplaceModels = [
  { id: 1, name: 'كشف الأسلحة المتقدم Pro', category: 'security', author: 'Elarian AI Labs', rating: 4.9, reviews: 234, downloads: 15420, price: 'مجاني', accuracy: 98.5, versions: ['3.0.1', '3.0.0', '2.9.5'], trending: true, verified: true, description: 'نموذج متقدم لكشف الأسلحة بدقة عالية' },
  { id: 2, name: 'التعرف على الوجوه Enterprise', category: 'people', author: 'VisionTech', rating: 4.8, reviews: 189, downloads: 12300, price: '$99/شهر', accuracy: 99.2, versions: ['4.1.0', '4.0.2'], trending: true, verified: true, description: 'حل مؤسسي للتعرف على الوجوه' },
  { id: 3, name: 'تحليل لغة الجسد AI', category: 'behavior', author: 'BehaviorAI', rating: 4.7, reviews: 156, downloads: 8900, price: '$49/شهر', accuracy: 94.8, versions: ['2.0.0', '1.9.8'], trending: false, verified: true, description: 'تحليل متقدم للغة الجسد والسلوك' },
  { id: 4, name: 'كشف الحرائق الذكي', category: 'safety', author: 'SafetyFirst', rating: 4.6, reviews: 98, downloads: 5600, price: 'مجاني', accuracy: 97.1, versions: ['1.5.0'], trending: false, verified: false, description: 'كشف مبكر للحرائق والدخان' },
  { id: 5, name: 'تحليل المرور المتقدم', category: 'traffic', author: 'TrafficAI', rating: 4.5, reviews: 145, downloads: 7800, price: '$79/شهر', accuracy: 96.3, versions: ['2.1.0', '2.0.5'], trending: true, verified: true, description: 'تحليل شامل لحركة المرور' },
  { id: 6, name: 'كشف التسلل الليلي', category: 'security', author: 'NightWatch', rating: 4.8, reviews: 112, downloads: 4500, price: '$59/شهر', accuracy: 95.8, versions: ['1.2.0'], trending: false, verified: true, description: 'كشف التسلل في الإضاءة المنخفضة' },
];

const categories = [
  { id: 'all', name: 'الكل', icon: Package },
  { id: 'security', name: 'الأمن', icon: Shield },
  { id: 'people', name: 'الأفراد', icon: Users },
  { id: 'behavior', name: 'السلوك', icon: Brain },
  { id: 'safety', name: 'السلامة', icon: Eye },
  { id: 'traffic', name: 'المرور', icon: Car },
];

export default function AIModelMarketplace() {
  const [models, setModels] = useState(marketplaceModels);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedModel, setSelectedModel] = useState(null);
  const [showModelDetail, setShowModelDetail] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState('browse');

  // توصيات AI
  const getRecommendationsMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `بناءً على استخدام المنصة الحالي واتجاهات المشاريع، قدم توصيات لنماذج AI Vision:

أنواع النماذج المتاحة: أمن، أفراد، سلوك، سلامة، مرور

قدم 5 توصيات مخصصة مع تبرير لكل توصية.`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  model_type: { type: "string" },
                  reason: { type: "string" },
                  priority: { type: "string" },
                  expected_benefit: { type: "string" }
                }
              }
            },
            trending_categories: { type: "array", items: { type: "string" } },
            insights: { type: "string" }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setRecommendations(data.recommendations || []);
      toast.success('تم تحديث التوصيات');
    }
  });

  useEffect(() => {
    getRecommendationsMutation.mutate();
  }, []);

  const filteredModels = models.filter(m => {
    if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
    if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'popular') return b.downloads - a.downloads;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'newest') return b.id - a.id;
    return 0;
  });

  const stats = {
    totalModels: models.length,
    totalDownloads: models.reduce((s, m) => s + m.downloads, 0),
    avgRating: (models.reduce((s, m) => s + m.rating, 0) / models.length).toFixed(1),
    verifiedModels: models.filter(m => m.verified).length
  };

  const handleDownload = (model) => {
    toast.success(`جاري تحميل ${model.name}...`);
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20"
          >
            <Store className="w-6 h-6 text-purple-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold text-lg">سوق نماذج AI Vision</h4>
            <p className="text-slate-400 text-xs">اكتشف • شارك • حقق الدخل</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-purple-500/50">
            <Plus className="w-4 h-4 ml-1" />
            نشر نموذج
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <ShoppingCart className="w-4 h-4 ml-1" />
            سلتي (0)
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <Package className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.totalModels}</p>
            <p className="text-slate-400 text-xs">نموذج متاح</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <Download className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.totalDownloads.toLocaleString()}</p>
            <p className="text-slate-400 text-xs">تحميل</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <Star className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.avgRating}</p>
            <p className="text-slate-400 text-xs">متوسط التقييم</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.verifiedModels}</p>
            <p className="text-slate-400 text-xs">نموذج موثق</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="browse" className="data-[state=active]:bg-purple-500/20">
            <Store className="w-3 h-3 ml-1" />
            تصفح
          </TabsTrigger>
          <TabsTrigger value="trending" className="data-[state=active]:bg-pink-500/20">
            <TrendingUp className="w-3 h-3 ml-1" />
            الرائج
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-cyan-500/20">
            <Sparkles className="w-3 h-3 ml-1" />
            توصيات AI
          </TabsTrigger>
          <TabsTrigger value="my-models" className="data-[state=active]:bg-green-500/20">
            <Package className="w-3 h-3 ml-1" />
            نماذجي
          </TabsTrigger>
          <TabsTrigger value="monetization" className="data-[state=active]:bg-emerald-500/20">
            <DollarSign className="w-3 h-3 ml-1" />
            تحقيق الدخل
          </TabsTrigger>
        </TabsList>

        {/* Browse Tab */}
        <TabsContent value="browse" className="mt-4 space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في النماذج..."
                className="bg-slate-800/50 border-slate-700 text-white pr-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white w-40">
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <cat.icon className="w-4 h-4" />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white w-40">
                <SelectValue placeholder="ترتيب" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="popular">الأكثر شعبية</SelectItem>
                <SelectItem value="rating">الأعلى تقييماً</SelectItem>
                <SelectItem value="newest">الأحدث</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Models Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModels.map((model) => (
              <motion.div
                key={model.id}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="bg-slate-800/40 border-slate-700/50 hover:border-purple-500/50 transition-all cursor-pointer h-full"
                  onClick={() => { setSelectedModel(model); setShowModelDetail(true); }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {model.verified && (
                          <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                            <CheckCircle className="w-3 h-3 ml-1" />
                            موثق
                          </Badge>
                        )}
                        {model.trending && (
                          <Badge className="bg-pink-500/20 text-pink-400 text-xs">
                            <TrendingUp className="w-3 h-3 ml-1" />
                            رائج
                          </Badge>
                        )}
                      </div>
                      <Badge className={model.price === 'مجاني' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                        {model.price}
                      </Badge>
                    </div>
                    
                    <h5 className="text-white font-bold mb-1">{model.name}</h5>
                    <p className="text-slate-400 text-xs mb-3">{model.description}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-purple-500/20 text-purple-400 text-xs">
                          {model.author[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-slate-300 text-sm">{model.author}</span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-white font-medium">{model.rating}</span>
                        <span className="text-slate-400 text-xs">({model.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-xs">
                        <Download className="w-3 h-3" />
                        {model.downloads.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-slate-600 text-xs">
                        <GitBranch className="w-3 h-3 ml-1" />
                        v{model.versions[0]}
                      </Badge>
                      <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                        دقة {model.accuracy}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Trending Tab */}
        <TabsContent value="trending" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {models.filter(m => m.trending).map((model, i) => (
              <Card key={model.id} className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/30">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    #{i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="text-white font-bold">{model.name}</h5>
                      {model.verified && <CheckCircle className="w-4 h-4 text-blue-400" />}
                    </div>
                    <p className="text-slate-400 text-xs">{model.author}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-amber-400 text-sm flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {model.rating}
                      </span>
                      <span className="text-slate-400 text-xs flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {model.downloads.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" className="bg-pink-600 hover:bg-pink-700">
                    عرض
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Recommendations Tab */}
        <TabsContent value="recommendations" className="mt-4">
          <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30 mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                توصيات مخصصة بواسطة AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getRecommendationsMutation.isPending ? (
                <div className="text-center py-6">
                  <Loader2 className="w-8 h-8 text-cyan-400 mx-auto animate-spin mb-2" />
                  <p className="text-slate-400">جاري تحليل احتياجاتك...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((rec, i) => (
                    <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{rec.model_type}</span>
                        <Badge className={`text-xs ${
                          rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          rec.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>{rec.priority}</Badge>
                      </div>
                      <p className="text-slate-400 text-sm mb-1">{rec.reason}</p>
                      <p className="text-cyan-400 text-xs">الفائدة المتوقعة: {rec.expected_benefit}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Models Tab */}
        <TabsContent value="my-models" className="mt-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-8 text-center">
              <Package className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h5 className="text-white font-bold mb-2">لا توجد نماذج منشورة</h5>
              <p className="text-slate-400 text-sm mb-4">ابدأ بنشر نموذجك الأول لمشاركته مع المجتمع</p>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 ml-1" />
                نشر نموذج جديد
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monetization Tab */}
        <TabsContent value="monetization" className="mt-4">
          <AIMonetizationEngine modelId={modelId} usageData={{}} />
        </TabsContent>
      </Tabs>

      {/* Model Detail Dialog */}
      <Dialog open={showModelDetail} onOpenChange={setShowModelDetail}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedModel && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  {selectedModel.name}
                  {selectedModel.verified && <CheckCircle className="w-5 h-5 text-blue-400" />}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-purple-500/20 text-purple-400">
                      {selectedModel.author[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">{selectedModel.author}</p>
                    <p className="text-slate-400 text-sm">ناشر موثق</p>
                  </div>
                </div>

                <p className="text-slate-300">{selectedModel.description}</p>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <Star className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                    <p className="text-white font-bold">{selectedModel.rating}</p>
                    <p className="text-slate-400 text-xs">{selectedModel.reviews} مراجعة</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <Download className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-white font-bold">{selectedModel.downloads.toLocaleString()}</p>
                    <p className="text-slate-400 text-xs">تحميل</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <Zap className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <p className="text-white font-bold">{selectedModel.accuracy}%</p>
                    <p className="text-slate-400 text-xs">دقة</p>
                  </div>
                </div>

                <div>
                  <p className="text-slate-400 text-sm mb-2">الإصدارات المتاحة:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedModel.versions.map((v, i) => (
                      <Badge key={v} className={i === 0 ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-300'}>
                        v{v} {i === 0 && '(أحدث)'}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => handleDownload(selectedModel)}>
                    <Download className="w-4 h-4 ml-1" />
                    {selectedModel.price === 'مجاني' ? 'تحميل مجاني' : `شراء - ${selectedModel.price}`}
                  </Button>
                  <Button variant="outline" className="border-slate-600">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="border-slate-600">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}