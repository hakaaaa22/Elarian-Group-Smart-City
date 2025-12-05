import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Shield, Users, BarChart3, AlertTriangle, CheckCircle, Clock,
  FileText, Settings, Zap, TrendingUp, Activity, Lock, Eye, Search,
  RefreshCw, Download, Send, Bot, Sparkles, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Quick Actions for Admin
const quickActions = [
  { id: 'usage_report', label: 'تقرير استخدام النظام', icon: BarChart3, color: 'cyan' },
  { id: 'user_analysis', label: 'تحليل المستخدمين', icon: Users, color: 'purple' },
  { id: 'security_audit', label: 'فحص أمني شامل', icon: Shield, color: 'red' },
  { id: 'permission_review', label: 'مراجعة الصلاحيات', icon: Lock, color: 'amber' },
  { id: 'performance_metrics', label: 'مؤشرات الأداء', icon: TrendingUp, color: 'green' },
  { id: 'automation_suggestions', label: 'اقتراحات أتمتة', icon: Zap, color: 'blue' },
];

// Mock Security Alerts
const securityAlerts = [
  { id: 1, type: 'warning', message: 'محاولات تسجيل دخول فاشلة متعددة من IP: 192.168.1.xxx', time: '10 دقائق', severity: 'medium' },
  { id: 2, type: 'info', message: '3 مستخدمين لم يغيروا كلمة المرور منذ 90 يوم', time: '1 ساعة', severity: 'low' },
  { id: 3, type: 'alert', message: 'صلاحيات مرتفعة لحساب غير نشط', time: '2 ساعة', severity: 'high' },
];

// Mock Usage Stats
const usageStats = {
  activeUsers: 45,
  totalSessions: 234,
  avgSessionTime: '18 دقيقة',
  peakHour: '10:00 - 11:00',
  mostUsedFeature: 'إدارة المهام',
  systemUptime: '99.9%',
};

export default function AdminAIAssistant() {
  const [activeTab, setActiveTab] = useState('assistant');
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  // AI Analysis Mutation
  const aiAnalysisMutation = useMutation({
    mutationFn: async (prompt) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مساعد ذكي لمدراء النظام. قم بتحليل وتقديم توصيات بناءً على الطلب التالي:

${prompt}

بيانات النظام الحالية:
- المستخدمين النشطين: ${usageStats.activeUsers}
- الجلسات: ${usageStats.totalSessions}
- متوسط وقت الجلسة: ${usageStats.avgSessionTime}
- وقت التشغيل: ${usageStats.systemUptime}
- التنبيهات الأمنية: ${securityAlerts.length}

قدم تحليلاً شاملاً مع توصيات عملية.`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            findings: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            riskLevel: { type: "string", enum: ["low", "medium", "high"] },
            actionItems: { type: "array", items: { 
              type: "object",
              properties: {
                action: { type: "string" },
                priority: { type: "string" },
                deadline: { type: "string" }
              }
            }},
            metrics: { type: "object" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAiResponse(data);
      setChatHistory([...chatHistory, 
        { role: 'user', content: query },
        { role: 'assistant', content: data }
      ]);
      setQuery('');
      setIsAnalyzing(false);
    },
    onError: () => {
      toast.error('حدث خطأ في التحليل');
      setIsAnalyzing(false);
    }
  });

  const handleQuickAction = (actionId) => {
    const prompts = {
      usage_report: 'قم بإنشاء تقرير شامل عن استخدام النظام يتضمن: عدد المستخدمين، الميزات الأكثر استخداماً، أوقات الذروة، ومقترحات لتحسين الأداء.',
      user_analysis: 'حلل بيانات المستخدمين وقدم رؤى حول: أنماط الاستخدام، المستخدمين غير النشطين، توزيع الصلاحيات، ومقترحات لتحسين تجربة المستخدم.',
      security_audit: 'أجرِ فحصاً أمنياً شاملاً يتضمن: تحليل محاولات الدخول الفاشلة، الحسابات ذات الصلاحيات المرتفعة، الثغرات المحتملة، وتوصيات لتعزيز الأمان.',
      permission_review: 'راجع صلاحيات المستخدمين وقدم توصيات حول: الصلاحيات الزائدة، مبدأ أقل صلاحيات، فصل المهام، وتحسين بنية الأدوار.',
      performance_metrics: 'حلل مؤشرات أداء النظام وقدم: تقييم للأداء الحالي، مقارنة مع الفترات السابقة، نقاط الضعف، وخطة تحسين.',
      automation_suggestions: 'اقترح فرص أتمتة للعمليات الإدارية تتضمن: المهام المتكررة، سير العمل القابل للأتمتة، التوفير المتوقع، وأولويات التنفيذ.',
    };
    
    setQuery(prompts[actionId] || '');
    handleSubmit(prompts[actionId]);
  };

  const handleSubmit = (customQuery) => {
    const q = customQuery || query;
    if (!q.trim()) return;
    setIsAnalyzing(true);
    aiAnalysisMutation.mutate(q);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="w-7 h-7 text-purple-400" />
            مساعد المدير الذكي
          </h1>
          <p className="text-slate-400 text-sm">تحليلات ذكية وتوصيات لإدارة النظام</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'المستخدمين النشطين', value: usageStats.activeUsers, icon: Users, color: 'cyan' },
          { label: 'الجلسات', value: usageStats.totalSessions, icon: Activity, color: 'green' },
          { label: 'متوسط الجلسة', value: usageStats.avgSessionTime, icon: Clock, color: 'amber' },
          { label: 'وقت الذروة', value: usageStats.peakHour, icon: TrendingUp, color: 'purple' },
          { label: 'وقت التشغيل', value: usageStats.systemUptime, icon: CheckCircle, color: 'green' },
          { label: 'تنبيهات أمنية', value: securityAlerts.length, icon: AlertTriangle, color: 'red' },
        ].map((stat, i) => (
          <Card key={stat.label} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-3 text-center">
              <stat.icon className={`w-5 h-5 text-${stat.color}-400 mx-auto mb-1`} />
              <p className="text-lg font-bold text-white">{stat.value}</p>
              <p className="text-[10px] text-slate-400">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* AI Assistant */}
        <div className="lg:col-span-2">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" />
                المساعد الذكي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {quickActions.map(action => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.id}
                      variant="outline"
                      className={`border-${action.color}-500/30 text-${action.color}-400 h-auto py-3 flex-col items-start`}
                      onClick={() => handleQuickAction(action.id)}
                      disabled={isAnalyzing}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      <span className="text-xs text-right">{action.label}</span>
                    </Button>
                  );
                })}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="اسأل المساعد الذكي عن أي شيء يتعلق بإدارة النظام..."
                  className="bg-slate-800/50 border-slate-700 text-white min-h-[80px]"
                />
              </div>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700" 
                onClick={() => handleSubmit()}
                disabled={isAnalyzing || !query.trim()}
              >
                {isAnalyzing ? (
                  <><RefreshCw className="w-4 h-4 ml-2 animate-spin" />جاري التحليل...</>
                ) : (
                  <><Sparkles className="w-4 h-4 ml-2" />تحليل</>
                )}
              </Button>

              {/* AI Response */}
              <AnimatePresence>
                {aiResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Summary */}
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <h4 className="text-purple-400 font-medium mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        ملخص التحليل
                      </h4>
                      <p className="text-white text-sm">{aiResponse.summary}</p>
                      {aiResponse.riskLevel && (
                        <Badge className={`mt-2 ${
                          aiResponse.riskLevel === 'high' ? 'bg-red-500/20 text-red-400' :
                          aiResponse.riskLevel === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          مستوى المخاطر: {aiResponse.riskLevel === 'high' ? 'عالي' : aiResponse.riskLevel === 'medium' ? 'متوسط' : 'منخفض'}
                        </Badge>
                      )}
                    </div>

                    {/* Findings */}
                    {aiResponse.findings?.length > 0 && (
                      <div className="p-4 bg-slate-800/50 rounded-lg">
                        <h4 className="text-cyan-400 font-medium mb-2">النتائج</h4>
                        <ul className="space-y-1">
                          {aiResponse.findings.map((finding, i) => (
                            <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                              <ChevronRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                              {finding}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {aiResponse.recommendations?.length > 0 && (
                      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <h4 className="text-green-400 font-medium mb-2">التوصيات</h4>
                        <ul className="space-y-1">
                          {aiResponse.recommendations.map((rec, i) => (
                            <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Items */}
                    {aiResponse.actionItems?.length > 0 && (
                      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <h4 className="text-amber-400 font-medium mb-2">خطوات العمل</h4>
                        <div className="space-y-2">
                          {aiResponse.actionItems.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                              <span className="text-white text-sm">{item.action}</span>
                              <div className="flex items-center gap-2">
                                <Badge className={item.priority === 'عالي' || item.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}>
                                  {item.priority}
                                </Badge>
                                {item.deadline && <span className="text-slate-500 text-xs">{item.deadline}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button variant="outline" className="border-slate-600" onClick={() => toast.success('تم تصدير التقرير')}>
                      <Download className="w-4 h-4 ml-2" />
                      تصدير التقرير
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Security Alerts */}
        <div>
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-400" />
                التنبيهات الأمنية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityAlerts.map(alert => (
                  <div 
                    key={alert.id} 
                    className={`p-3 rounded-lg border ${
                      alert.severity === 'high' ? 'bg-red-500/10 border-red-500/30' :
                      alert.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
                      'bg-blue-500/10 border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                        alert.severity === 'high' ? 'text-red-400' :
                        alert.severity === 'medium' ? 'text-amber-400' :
                        'text-blue-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-white text-sm">{alert.message}</p>
                        <p className="text-slate-500 text-xs mt-1">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-4 border-red-500/50 text-red-400"
                onClick={() => handleQuickAction('security_audit')}
              >
                <Shield className="w-4 h-4 ml-2" />
                فحص أمني شامل
              </Button>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 mt-4">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-400" />
                صحة النظام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'الخادم', value: 98, status: 'جيد' },
                  { label: 'قاعدة البيانات', value: 95, status: 'جيد' },
                  { label: 'الذاكرة', value: 72, status: 'متوسط' },
                  { label: 'التخزين', value: 45, status: 'جيد' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400 text-sm">{item.label}</span>
                      <span className={`text-sm ${item.value > 80 ? 'text-green-400' : item.value > 60 ? 'text-amber-400' : 'text-red-400'}`}>
                        {item.value}%
                      </span>
                    </div>
                    <Progress value={item.value} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}