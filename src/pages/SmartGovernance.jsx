import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Building2, FileText, CheckCircle, Clock, Users, Brain, MessageSquare,
  TrendingUp, AlertTriangle, Shield, Zap, BarChart3, Star, Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// الخدمات الإلكترونية
const eServices = [
  { id: 1, name: 'تجديد الهوية الرقمية', category: 'هوية', requests: 1250, avgTime: '2 ساعة', sla: 98 },
  { id: 2, name: 'رخصة البناء', category: 'تراخيص', requests: 456, avgTime: '3 أيام', sla: 92 },
  { id: 3, name: 'رخصة النشاط التجاري', category: 'تراخيص', requests: 892, avgTime: '24 ساعة', sla: 95 },
  { id: 4, name: 'شهادة عدم ممانعة', category: 'شهادات', requests: 2100, avgTime: '4 ساعات', sla: 97 },
  { id: 5, name: 'تصريح الفعاليات', category: 'تصاريح', requests: 234, avgTime: '2 يوم', sla: 90 },
];

// طلبات الموافقة
const pendingApprovals = [
  { id: 1, type: 'رخصة بناء', applicant: 'شركة الإنشاءات', submitted: '2024-12-01', priority: 'high', aiRecommendation: 'موافقة' },
  { id: 2, type: 'نشاط تجاري', applicant: 'مؤسسة التقنية', submitted: '2024-12-02', priority: 'medium', aiRecommendation: 'موافقة مشروطة' },
  { id: 3, type: 'تصريح فعالية', applicant: 'جمعية ثقافية', submitted: '2024-12-03', priority: 'low', aiRecommendation: 'موافقة' },
];

// رؤى المجتمع
const communityInsights = [
  { topic: 'النظافة العامة', sentiment: 'positive', mentions: 1250, trend: '+15%' },
  { topic: 'حركة المرور', sentiment: 'negative', mentions: 890, trend: '+8%' },
  { topic: 'الحدائق العامة', sentiment: 'positive', mentions: 456, trend: '+22%' },
  { topic: 'الخدمات الصحية', sentiment: 'neutral', mentions: 678, trend: '-3%' },
];

export default function SmartGovernance() {
  const [activeTab, setActiveTab] = useState('services');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(null);

  // مساعد الحاكم AI
  const askGovernorAI = useMutation({
    mutationFn: async (query) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مساعد ذكي للحاكم/المحافظ. أجب على السؤال التالي بناءً على بيانات المدينة:

السؤال: ${query}

قدم إجابة شاملة تتضمن:
1. تحليل الوضع الحالي
2. التوصيات
3. الإجراءات المقترحة
4. المخاطر المحتملة`,
        response_json_schema: {
          type: "object",
          properties: {
            analysis: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } },
            actions: { type: "array", items: { type: "string" } },
            risks: { type: "array", items: { type: "string" } },
            priority: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAiResponse(data);
    }
  });

  // تحليل رؤى المجتمع
  const analyzeCommunity = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `حلل رؤى المجتمع التالية وقدم تقريراً:
${JSON.stringify(communityInsights)}

قدم:
1. ملخص المشاعر العامة
2. القضايا الأكثر إلحاحاً
3. الفرص للتحسين
4. توصيات للحاكم`,
        response_json_schema: {
          type: "object",
          properties: {
            overallSentiment: { type: "string" },
            urgentIssues: { type: "array", items: { type: "string" } },
            opportunities: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: () => {
      toast.success('تم تحليل رؤى المجتمع');
    }
  });

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'green';
      case 'negative': return 'red';
      default: return 'amber';
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-cyan-400" />
              الحوكمة الذكية والحكومة الرقمية
            </h1>
            <p className="text-slate-400 mt-1">إدارة الخدمات الحكومية والتصاريح والموافقات</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowAIAssistant(true)}>
            <Brain className="w-4 h-4 ml-2" />
            مساعد الحاكم AI
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <Users className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">2.4M</p>
            <p className="text-cyan-400 text-xs">هوية رقمية</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <FileText className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">5,432</p>
            <p className="text-green-400 text-xs">طلبات اليوم</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <CheckCircle className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">96%</p>
            <p className="text-purple-400 text-xs">معدل SLA</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <Clock className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">45</p>
            <p className="text-amber-400 text-xs">بانتظار الموافقة</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="services">الخدمات الإلكترونية</TabsTrigger>
          <TabsTrigger value="approvals">الموافقات الذكية</TabsTrigger>
          <TabsTrigger value="community">رؤى المجتمع</TabsTrigger>
          <TabsTrigger value="sla">أداء SLA</TabsTrigger>
        </TabsList>

        {/* E-Services Tab */}
        <TabsContent value="services" className="mt-4">
          <div className="space-y-3">
            {eServices.map(service => (
              <Card key={service.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-white font-medium">{service.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-slate-700 text-slate-300">{service.category}</Badge>
                          <span className="text-slate-500 text-xs">{service.requests} طلب</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <p className="text-slate-400 text-xs">متوسط الوقت</p>
                        <p className="text-white">{service.avgTime}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-slate-400 text-xs">SLA</p>
                        <Badge className={service.sla >= 95 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                          {service.sla}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Smart Approvals Tab */}
        <TabsContent value="approvals" className="mt-4">
          <div className="space-y-3">
            {pendingApprovals.map(approval => (
              <Card key={approval.id} className={`glass-card border-${approval.priority === 'high' ? 'red' : approval.priority === 'medium' ? 'amber' : 'slate'}-500/30 bg-[#0f1629]/80`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-medium">{approval.type}</p>
                        <Badge className={`bg-${approval.priority === 'high' ? 'red' : approval.priority === 'medium' ? 'amber' : 'slate'}-500/20 text-${approval.priority === 'high' ? 'red' : approval.priority === 'medium' ? 'amber' : 'slate'}-400`}>
                          {approval.priority === 'high' ? 'عاجل' : approval.priority === 'medium' ? 'متوسط' : 'عادي'}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm">{approval.applicant}</p>
                      <p className="text-slate-500 text-xs mt-1">تقديم: {approval.submitted}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-slate-400 text-xs mb-1">توصية AI</p>
                      <Badge className={approval.aiRecommendation === 'موافقة' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                        <Brain className="w-3 h-3 ml-1" />
                        {approval.aiRecommendation}
                      </Badge>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">موافقة</Button>
                        <Button size="sm" variant="outline" className="border-red-500 text-red-400">رفض</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Community Insights Tab */}
        <TabsContent value="community" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 mb-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  تحليل رؤى المجتمع
                </CardTitle>
                <Button size="sm" variant="outline" className="border-purple-500 text-purple-400" onClick={() => analyzeCommunity.mutate()}>
                  <Brain className="w-3 h-3 ml-1" />
                  تحليل AI
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {communityInsights.map((insight, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-${getSentimentColor(insight.sentiment)}-400`} />
                      <span className="text-white">{insight.topic}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400 text-sm">{insight.mentions} إشارة</span>
                      <Badge className={insight.trend.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {insight.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SLA Tab */}
        <TabsContent value="sla" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {eServices.map(service => (
              <Card key={service.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">{service.name}</span>
                    <span className={`text-${service.sla >= 95 ? 'green' : service.sla >= 90 ? 'amber' : 'red'}-400 font-bold`}>{service.sla}%</span>
                  </div>
                  <Progress value={service.sla} className="h-2" />
                  <p className="text-slate-500 text-xs mt-2">الهدف: 95%</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Assistant Dialog */}
      <Dialog open={showAIAssistant} onOpenChange={setShowAIAssistant}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              مساعد الحاكم الذكي
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Textarea
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="اسأل عن أي شيء يتعلق بإدارة المدينة..."
              className="bg-slate-800/50 border-slate-700 text-white h-24"
            />
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => askGovernorAI.mutate(aiQuery)} disabled={askGovernorAI.isPending || !aiQuery}>
              {askGovernorAI.isPending ? 'جاري التحليل...' : 'تحليل'}
            </Button>
            {aiResponse && (
              <div className="p-4 bg-slate-800/50 rounded-lg space-y-3">
                <div>
                  <p className="text-purple-400 font-medium mb-1">التحليل:</p>
                  <p className="text-slate-300 text-sm">{aiResponse.analysis}</p>
                </div>
                {aiResponse.recommendations?.length > 0 && (
                  <div>
                    <p className="text-green-400 font-medium mb-1">التوصيات:</p>
                    <ul className="text-slate-300 text-sm space-y-1">
                      {aiResponse.recommendations.map((rec, i) => (
                        <li key={i}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}