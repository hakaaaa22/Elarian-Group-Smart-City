import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Target, TrendingUp, Brain, Users, MessageSquare, Plus, Save,
  Trophy, Star, Lightbulb, CheckCircle, Send, ThumbsUp, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const defaultMetrics = [
  { id: 'satisfaction', name: 'رضا العملاء', current: 85, unit: '%' },
  { id: 'resolution', name: 'معدل الحل', current: 78, unit: '%' },
  { id: 'response_time', name: 'سرعة الاستجابة', current: 45, unit: 'ث' },
  { id: 'calls_handled', name: 'المكالمات المعالجة', current: 42, unit: '' },
  { id: 'upsell_rate', name: 'معدل البيع الإضافي', current: 15, unit: '%' }
];

const mockPeerPosts = [
  { id: 1, author: 'سارة أحمد', avatar: 'س', content: 'نصيحة: عند التعامل مع عميل غاضب، اسمح له بالتعبير أولاً ثم اعتذر بصدق', likes: 12, time: '2 ساعة', type: 'tip' },
  { id: 2, author: 'محمد علي', avatar: 'م', content: 'كيف تتعاملون مع العملاء الذين يطلبون تخفيضات غير متاحة؟', likes: 5, time: '4 ساعة', type: 'question' },
  { id: 3, author: 'نورة السالم', avatar: 'ن', content: 'حققت 95% رضا هذا الأسبوع! السر هو المتابعة بعد كل مكالمة', likes: 18, time: '1 يوم', type: 'success' }
];

export default function AgentGoalsAndCoaching({ agentId }) {
  const [goals, setGoals] = useState([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ metric: '', target: '', deadline: '' });
  const [peerPosts, setPeerPosts] = useState(mockPeerPosts);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('tip');
  const [aiTips, setAiTips] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(`agent_goals_${agentId || 'default'}`);
    if (saved) setGoals(JSON.parse(saved));
  }, [agentId]);

  const generateTipsMutation = useMutation({
    mutationFn: async (goalMetric) => {
      const metric = defaultMetrics.find(m => m.id === goalMetric);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنا وكيل مركز اتصال أريد تحسين "${metric?.name}".
المستوى الحالي: ${metric?.current}${metric?.unit}

قدم 5 نصائح عملية ومحددة لتحقيق هذا الهدف.`,
        response_json_schema: {
          type: "object",
          properties: {
            tips: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tip: { type: "string" },
                  impact: { type: "string" },
                  difficulty: { type: "string" }
                }
              }
            },
            estimated_improvement: { type: "number" },
            timeframe: { type: "string" }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setAiTips(data.tips || []);
      toast.success('تم إنشاء النصائح');
    }
  });

  const addGoal = () => {
    if (!newGoal.metric || !newGoal.target) return;
    
    const metric = defaultMetrics.find(m => m.id === newGoal.metric);
    const goal = {
      id: Date.now(),
      ...newGoal,
      metricName: metric?.name,
      current: metric?.current,
      unit: metric?.unit,
      createdAt: new Date().toISOString(),
      progress: Math.round((metric?.current / Number(newGoal.target)) * 100)
    };
    
    const updated = [...goals, goal];
    setGoals(updated);
    localStorage.setItem(`agent_goals_${agentId || 'default'}`, JSON.stringify(updated));
    setShowAddGoal(false);
    setNewGoal({ metric: '', target: '', deadline: '' });
    toast.success('تم إضافة الهدف');
  };

  const addPost = () => {
    if (!newPost.trim()) return;
    const post = {
      id: Date.now(),
      author: 'أنت',
      avatar: 'أ',
      content: newPost,
      likes: 0,
      time: 'الآن',
      type: postType
    };
    setPeerPosts([post, ...peerPosts]);
    setNewPost('');
    toast.success('تم نشر المشاركة');
  };

  const likePost = (postId) => {
    setPeerPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, likes: p.likes + 1 } : p
    ));
  };

  return (
    <div className="space-y-4" dir="rtl">
      <Tabs defaultValue="goals">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="goals" className="data-[state=active]:bg-green-500/20 text-xs">
            <Target className="w-3 h-3 ml-1" />
            أهدافي
          </TabsTrigger>
          <TabsTrigger value="coaching" className="data-[state=active]:bg-purple-500/20 text-xs">
            <Users className="w-3 h-3 ml-1" />
            تدريب الأقران
          </TabsTrigger>
          <TabsTrigger value="tips" className="data-[state=active]:bg-cyan-500/20 text-xs">
            <Lightbulb className="w-3 h-3 ml-1" />
            نصائح AI
          </TabsTrigger>
        </TabsList>

        {/* Goals Tab */}
        <TabsContent value="goals" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-white font-bold">أهداف الأداء الشخصية</h4>
            <Button size="sm" className="bg-green-600" onClick={() => setShowAddGoal(true)}>
              <Plus className="w-4 h-4 ml-1" />
              هدف جديد
            </Button>
          </div>

          {goals.length === 0 ? (
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-6 text-center">
                <Target className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">لم تحدد أهدافاً بعد</p>
                <Button className="mt-3" onClick={() => setShowAddGoal(true)}>إضافة هدف</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {goals.map(goal => (
                <Card key={goal.id} className={`${goal.progress >= 100 ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800/30 border-slate-700/50'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {goal.progress >= 100 && <Trophy className="w-5 h-5 text-amber-400" />}
                        <span className="text-white font-medium">{goal.metricName}</span>
                      </div>
                      <Badge className={goal.progress >= 100 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                        {goal.progress >= 100 ? 'مكتمل!' : `${goal.progress}%`}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm mb-2">
                      <span className="text-slate-400">الحالي: {goal.current}{goal.unit}</span>
                      <span className="text-cyan-400">الهدف: {goal.target}{goal.unit}</span>
                      {goal.deadline && <span className="text-slate-500">الموعد: {goal.deadline}</span>}
                    </div>
                    <Progress value={Math.min(goal.progress, 100)} className="h-2" />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-2 text-xs"
                      onClick={() => generateTipsMutation.mutate(goal.metric)}
                    >
                      <Brain className="w-3 h-3 ml-1" />
                      نصائح لتحقيق الهدف
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Peer Coaching Tab */}
        <TabsContent value="coaching" className="mt-4 space-y-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex gap-2 mb-3">
                {['tip', 'question', 'success'].map(type => (
                  <Button
                    key={type}
                    size="sm"
                    variant={postType === type ? 'default' : 'outline'}
                    className={`h-7 text-xs ${postType === type ? 'bg-purple-600' : 'border-slate-600'}`}
                    onClick={() => setPostType(type)}
                  >
                    {type === 'tip' ? '💡 نصيحة' : type === 'question' ? '❓ سؤال' : '🏆 إنجاز'}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="شارك نصيحة، اسأل سؤالاً، أو احتفل بإنجاز..."
                  className="bg-slate-900/50 border-slate-700 text-white text-sm h-16"
                />
                <Button className="bg-purple-600" onClick={addPost}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {peerPosts.map(post => (
                <Card key={post.id} className={`${
                  post.type === 'success' ? 'bg-green-500/10 border-green-500/30' :
                  post.type === 'question' ? 'bg-amber-500/10 border-amber-500/30' :
                  'bg-purple-500/10 border-purple-500/30'
                }`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm">
                        {post.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium text-sm">{post.author}</span>
                          <Badge className="text-xs bg-slate-700">
                            {post.type === 'tip' ? '💡 نصيحة' : post.type === 'question' ? '❓ سؤال' : '🏆 إنجاز'}
                          </Badge>
                          <span className="text-slate-500 text-xs">{post.time}</span>
                        </div>
                        <p className="text-slate-300 text-sm">{post.content}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-2 h-6 text-xs"
                          onClick={() => likePost(post.id)}
                        >
                          <ThumbsUp className="w-3 h-3 ml-1" />
                          {post.likes}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* AI Tips Tab */}
        <TabsContent value="tips" className="mt-4">
          <Card className="bg-cyan-500/10 border-cyan-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                نصائح AI مخصصة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiTips.length === 0 ? (
                <div className="text-center py-6">
                  <Lightbulb className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">اختر هدفاً للحصول على نصائح مخصصة</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {aiTips.map((tip, i) => (
                    <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                      <p className="text-white text-sm">{tip.tip}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge className="text-xs bg-green-500/20 text-green-400">{tip.impact}</Badge>
                        <Badge className="text-xs bg-slate-600">{tip.difficulty}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Goal Dialog */}
      <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
        <DialogContent className="bg-[#0f1629] border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">إضافة هدف جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">المقياس</Label>
              <select
                value={newGoal.metric}
                onChange={(e) => setNewGoal(prev => ({ ...prev, metric: e.target.value }))}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-md p-2 text-white"
              >
                <option value="">اختر المقياس</option>
                {defaultMetrics.map(m => (
                  <option key={m.id} value={m.id}>{m.name} (حالياً: {m.current}{m.unit})</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-slate-300">الهدف</Label>
              <Input
                type="number"
                value={newGoal.target}
                onChange={(e) => setNewGoal(prev => ({ ...prev, target: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white mt-1"
                placeholder="مثال: 90"
              />
            </div>
            <div>
              <Label className="text-slate-300">الموعد النهائي</Label>
              <Input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-green-600" onClick={addGoal}>
                <Save className="w-4 h-4 ml-2" />
                حفظ الهدف
              </Button>
              <Button variant="outline" className="border-slate-600" onClick={() => setShowAddGoal(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}