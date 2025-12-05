import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star, MessageSquare, Send, ThumbsUp, ThumbsDown, BarChart3,
  TrendingUp, Users, Shield, Smile, Meh, Frown, Award, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

const feedbackCategories = [
  { id: 'security', name: 'الأمن والسلامة', icon: Shield },
  { id: 'staff', name: 'تعامل الموظفين', icon: Users },
  { id: 'facility', name: 'راحة المرافق', icon: Award },
  { id: 'process', name: 'سرعة الإجراءات', icon: TrendingUp },
];

const mockFeedback = [
  { id: 1, visitor: 'أحمد محمد', date: '2025-01-15', ratings: { security: 5, staff: 5, facility: 4, process: 4 }, comment: 'تجربة ممتازة، الموظفون محترفون جداً', overall: 4.5 },
  { id: 2, visitor: 'سارة خالد', date: '2025-01-14', ratings: { security: 4, staff: 3, facility: 4, process: 2 }, comment: 'الإجراءات كانت بطيئة بعض الشيء', overall: 3.25 },
  { id: 3, visitor: 'محمد علي', date: '2025-01-13', ratings: { security: 5, staff: 4, facility: 5, process: 5 }, comment: 'منشأة رائعة ونظيفة', overall: 4.75 },
];

const statsData = {
  totalFeedback: 156,
  averageRating: 4.2,
  satisfaction: 87,
  categoryAverages: { security: 4.5, staff: 4.1, facility: 4.3, process: 3.8 }
};

export default function VisitorFeedback() {
  const [activeTab, setActiveTab] = useState('submit');
  const [ratings, setRatings] = useState({ security: 0, staff: 0, facility: 0, process: 0 });
  const [comment, setComment] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('week');

  const handleRating = (category, value) => {
    setRatings({ ...ratings, [category]: value });
  };

  const submitFeedback = () => {
    if (Object.values(ratings).some(r => r === 0)) {
      toast.error('يرجى تقييم جميع الفئات');
      return;
    }
    toast.success('شكراً لتقييمك!');
    setRatings({ security: 0, staff: 0, facility: 0, process: 0 });
    setComment('');
  };

  const getOverallEmoji = (rating) => {
    if (rating >= 4) return <Smile className="w-5 h-5 text-green-400" />;
    if (rating >= 3) return <Meh className="w-5 h-5 text-amber-400" />;
    return <Frown className="w-5 h-5 text-red-400" />;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
            <Star className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">تقييم تجربة الزوار</h3>
            <p className="text-slate-500 text-sm">جمع وتحليل ملاحظات الزوار</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <MessageSquare className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{statsData.totalFeedback}</p>
            <p className="text-slate-500 text-sm">إجمالي التقييمات</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-400">{statsData.averageRating}</p>
            <p className="text-slate-500 text-sm">متوسط التقييم</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <ThumbsUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-400">{statsData.satisfaction}%</p>
            <p className="text-slate-500 text-sm">نسبة الرضا</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-400">+12%</p>
            <p className="text-slate-500 text-sm">تحسن هذا الشهر</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="submit">إرسال تقييم</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="history">سجل التقييمات</TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="mt-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white text-lg">تقييم زيارتك</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {feedbackCategories.map(category => (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <category.icon className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium">{category.name}</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <motion.button
                        key={star}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRating(category.id, star)}
                        className="p-2"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            star <= ratings[category.id] ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
              <div>
                <label className="text-white font-medium mb-2 block">ملاحظات إضافية</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="شاركنا رأيك..."
                  className="bg-slate-900/50 border-slate-700 text-white h-24"
                />
              </div>
              <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={submitFeedback}>
                <Send className="w-4 h-4 ml-2" />
                إرسال التقييم
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white text-sm">تقييم حسب الفئة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {feedbackCategories.map(category => (
                  <div key={category.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400 text-sm">{category.name}</span>
                      <span className="text-white font-bold">{statsData.categoryAverages[category.id]}</span>
                    </div>
                    <Progress value={statsData.categoryAverages[category.id] * 20} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white text-sm">توزيع التقييمات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-white">{star}</span>
                    </div>
                    <Progress value={star === 5 ? 45 : star === 4 ? 30 : star === 3 ? 15 : star === 2 ? 7 : 3} className="flex-1 h-2" />
                    <span className="text-slate-400 text-sm w-12">{star === 5 ? '45%' : star === 4 ? '30%' : star === 3 ? '15%' : star === 2 ? '7%' : '3%'}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-3">
          {mockFeedback.map(fb => (
            <Card key={fb.id} className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-cyan-500/20 text-cyan-400">{fb.visitor.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">{fb.visitor}</p>
                      <p className="text-slate-500 text-xs">{fb.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getOverallEmoji(fb.overall)}
                    <span className="text-white font-bold">{fb.overall}</span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mt-3">{fb.comment}</p>
                <div className="flex gap-2 mt-3">
                  {Object.entries(fb.ratings).map(([key, val]) => (
                    <Badge key={key} variant="outline" className="border-slate-600 text-slate-400">
                      {feedbackCategories.find(c => c.id === key)?.name.split(' ')[0]}: {val}★
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}