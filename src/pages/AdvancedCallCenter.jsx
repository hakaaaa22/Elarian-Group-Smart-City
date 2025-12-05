import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Headphones, Mic, Brain, Award, Eye, Workflow, Bot, Users, BarChart3,
  Phone, MessageSquare, Shield, Zap, Settings, Download, Target,
  Activity, Clock, CheckCircle, AlertTriangle, Globe, Languages,
  Volume2, Heart, Coffee, Sparkles, GraduationCap, FileText, LayoutGrid
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoiceAIEngine from '@/components/callcenter/VoiceAIEngine';
import AIWorkflowBuilder from '@/components/callcenter/AIWorkflowBuilder';
import RealTimeAgentHelper from '@/components/callcenter/RealTimeAgentHelper';
import AIQualityAssurance from '@/components/callcenter/AIQualityAssurance';
import SupervisorDashboard from '@/components/callcenter/SupervisorDashboard';
import AIReportsDashboard from '@/components/reports/AIReportsDashboard';
import UnifiedAgentWorkspace from '@/components/callcenter/UnifiedAgentWorkspace';
import AITrainingSimulator from '@/components/callcenter/AITrainingSimulator';
import CRMIntegrations from '@/components/callcenter/CRMIntegrations';
import BidirectionalCRMIntegration from '@/components/crm/BidirectionalCRMIntegration';
import AIUpsellCrossSellIdentifier from '@/components/crm/AIUpsellCrossSellIdentifier';
import CustomAutomationRulesBuilder from '@/components/automation/CustomAutomationRulesBuilder';
import PersonalizedAgentDashboard from '@/components/callcenter/PersonalizedAgentDashboard';
import RealtimeAgentCoaching from '@/components/callcenter/RealtimeAgentCoaching';
import AdvancedPredictiveAnalytics from '@/components/analytics/AdvancedPredictiveAnalytics';
import AIWorkflowGenerator from '@/components/automation/AIWorkflowGenerator';
import DeepJourneyAnalytics from '@/components/crm/DeepJourneyAnalytics';
import AutoRepairSystem from '@/components/system/AutoRepairSystem';
import UnifiedOmnichannelAnalytics from '@/components/analytics/UnifiedOmnichannelAnalytics';
import AdvancedAgentTrainingAI from '@/components/training/AdvancedAgentTrainingAI';
import AIAdvancedReportGenerator from '@/components/reports/AIAdvancedReportGenerator';
import EnhancedPersonalizedDashboard from '@/components/callcenter/EnhancedPersonalizedDashboard';
import DynamicTrainingScenarios from '@/components/training/DynamicTrainingScenarios';
import { toast } from 'sonner';

export default function AdvancedCallCenter() {
  const [activeTab, setActiveTab] = useState('voice-ai');
  const [isCallActive, setIsCallActive] = useState(false);
  const [customerStatement, setCustomerStatement] = useState('عندي مشكلة GPS مش بيظهر في الخريطة');

  const kpiData = {
    totalCalls: 1245,
    aiAnalyzed: 1180,
    avgSentiment: 72,
    threatDetected: 3,
    workflowsGenerated: 856,
    qaScore: 94,
    agentSatisfaction: 88,
    customerSatisfaction: 91,
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 via-cyan-500/20 to-purple-500/20"
            >
              <Headphones className="w-8 h-8 text-green-400" />
            </motion.div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
                مركز الاتصال الذكي المتقدم
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  AI-Powered
                </Badge>
              </h1>
              <p className="text-slate-400 mt-1">
                Voice AI • NLP • Sentiment • Workflow Builder • QA Engine • Realtime Agent Helper
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className={`border-green-500/50 ${isCallActive ? 'bg-green-500/20 text-green-400' : ''}`}
              onClick={() => {
                setIsCallActive(!isCallActive);
                toast.success(isCallActive ? 'تم إنهاء المكالمة' : 'بدء مكالمة تجريبية');
              }}
            >
              {isCallActive ? (
                <>
                  <Phone className="w-4 h-4 ml-2" />
                  إنهاء المكالمة
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 ml-2" />
                  مكالمة تجريبية
                </>
              )}
            </Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Download className="w-4 h-4 ml-2" />
              تقرير شامل
            </Button>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {[
          { label: 'المكالمات', value: kpiData.totalCalls.toLocaleString(), icon: Phone, color: 'cyan' },
          { label: 'محللة بـ AI', value: kpiData.aiAnalyzed.toLocaleString(), icon: Brain, color: 'purple' },
          { label: 'المشاعر', value: `${kpiData.avgSentiment}%`, icon: Heart, color: 'pink' },
          { label: 'تهديدات', value: kpiData.threatDetected, icon: AlertTriangle, color: 'red' },
          { label: 'Workflows', value: kpiData.workflowsGenerated, icon: Workflow, color: 'amber' },
          { label: 'QA Score', value: `${kpiData.qaScore}%`, icon: Award, color: 'green' },
          { label: 'رضا الوكلاء', value: `${kpiData.agentSatisfaction}%`, icon: Users, color: 'blue' },
          { label: 'رضا العملاء', value: `${kpiData.customerSatisfaction}%`, icon: CheckCircle, color: 'emerald' },
        ].map((kpi, i) => (
          <Card key={kpi.label} className={`bg-${kpi.color}-500/10 border-${kpi.color}-500/30`}>
            <CardContent className="p-3 text-center">
              <kpi.icon className={`w-4 h-4 text-${kpi.color}-400 mx-auto mb-1`} />
              <p className="text-lg font-bold text-white">{kpi.value}</p>
              <p className="text-[10px] text-slate-400">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap mb-6">
          <TabsTrigger value="voice-ai" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Mic className="w-4 h-4 ml-1" />
            Voice AI
          </TabsTrigger>
          <TabsTrigger value="workflow" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Workflow className="w-4 h-4 ml-1" />
            Workflow Builder
          </TabsTrigger>
          <TabsTrigger value="agent-helper" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Bot className="w-4 h-4 ml-1" />
            Agent Helper
          </TabsTrigger>
          <TabsTrigger value="qa" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Award className="w-4 h-4 ml-1" />
            QA Engine
          </TabsTrigger>
          <TabsTrigger value="supervisor" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
            <Eye className="w-4 h-4 ml-1" />
            Supervisor
          </TabsTrigger>
          <TabsTrigger value="workspace" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
            <Users className="w-4 h-4 ml-1" />
            Agent Workspace
          </TabsTrigger>
          <TabsTrigger value="training" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
            <Target className="w-4 h-4 ml-1" />
            Training
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <Zap className="w-4 h-4 ml-1" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="ai-reports" className="data-[state=active]:bg-gradient-to-r from-purple-500/20 to-pink-500/20">
            <BarChart3 className="w-4 h-4 ml-1" />
            AI Reports
          </TabsTrigger>
          <TabsTrigger value="crm-deep" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <Globe className="w-4 h-4 ml-1" />
            CRM متقدم
          </TabsTrigger>
          <TabsTrigger value="upsell" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Target className="w-4 h-4 ml-1" />
            فرص البيع
          </TabsTrigger>
          <TabsTrigger value="automation-rules" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Settings className="w-4 h-4 ml-1" />
            قواعد الأتمتة
          </TabsTrigger>
          <TabsTrigger value="personal-dashboard" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Activity className="w-4 h-4 ml-1" />
            لوحة شخصية
          </TabsTrigger>
          <TabsTrigger value="realtime-coaching" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
            <Sparkles className="w-4 h-4 ml-1" />
            تدريب فوري
          </TabsTrigger>
          <TabsTrigger value="predictive" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Brain className="w-4 h-4 ml-1" />
            تنبؤات متقدمة
          </TabsTrigger>
          <TabsTrigger value="workflow-ai" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Workflow className="w-4 h-4 ml-1" />
            منشئ الأتمتة
          </TabsTrigger>
          <TabsTrigger value="journey-deep" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Activity className="w-4 h-4 ml-1" />
            تحليل الرحلة
          </TabsTrigger>
          <TabsTrigger value="auto-repair" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Shield className="w-4 h-4 ml-1" />
            الإصلاح التلقائي
          </TabsTrigger>
          <TabsTrigger value="omnichannel-analytics" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
            <Globe className="w-4 h-4 ml-1" />
            Omnichannel
          </TabsTrigger>
          <TabsTrigger value="ai-training" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
            <GraduationCap className="w-4 h-4 ml-1" />
            تدريب AI
          </TabsTrigger>
          <TabsTrigger value="ai-reports" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
            <FileText className="w-4 h-4 ml-1" />
            تقارير AI
          </TabsTrigger>
          <TabsTrigger value="enhanced-dashboard" className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-400">
            <LayoutGrid className="w-4 h-4 ml-1" />
            لوحة متقدمة
          </TabsTrigger>
          <TabsTrigger value="dynamic-training" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400">
            <Award className="w-4 h-4 ml-1" />
            تدريب ديناميكي
          </TabsTrigger>
        </TabsList>

        {/* Voice AI Engine */}
        <TabsContent value="voice-ai">
          <VoiceAIEngine isActive={isCallActive} />
        </TabsContent>

        {/* AI Workflow Builder */}
        <TabsContent value="workflow">
          <AIWorkflowBuilder 
            customerStatement={customerStatement}
            isActive={true}
            onWorkflowComplete={(result) => {
              toast.success('تم إكمال سير العمل بنجاح!');
            }}
          />
        </TabsContent>

        {/* Real-time Agent Helper */}
        <TabsContent value="agent-helper">
          <RealTimeAgentHelper
            customerMessage="لدي مشكلة في جهاز التتبع، لا يظهر موقع السيارة منذ أمس"
            customerEmotion="frustrated"
            customerPersonality="direct"
            onSuggestResponse={(text) => {
              toast.success('تم نسخ الرد المقترح');
            }}
          />
        </TabsContent>

        {/* AI Quality Assurance */}
        <TabsContent value="qa">
          <AIQualityAssurance
            callData={{
              agent: 'سارة أحمد',
              duration: '5:30',
              customer: 'أحمد محمد',
              subject: 'مشكلة GPS',
              channel: 'phone'
            }}
          />
        </TabsContent>

        {/* Supervisor Dashboard */}
        <TabsContent value="supervisor">
          <SupervisorDashboard />
        </TabsContent>

        {/* Agent Workspace */}
        <TabsContent value="workspace">
          <UnifiedAgentWorkspace />
        </TabsContent>

        {/* Training */}
        <TabsContent value="training">
          <AITrainingSimulator />
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations">
          <CRMIntegrations />
        </TabsContent>

        {/* AI Reports Dashboard */}
        <TabsContent value="ai-reports">
          <AIReportsDashboard />
        </TabsContent>

        {/* Deep CRM Integration */}
        <TabsContent value="crm-deep">
          <div className="grid lg:grid-cols-2 gap-6">
            <BidirectionalCRMIntegration
              customerId="CUS-001"
              onCustomerDataFetched={(data) => {
                toast.success('تم تحميل سياق العميل');
              }}
            />
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-4">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  مميزات التكامل ثنائي الاتجاه
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-sm font-medium">✓ استرجاع تلقائي للسياق</p>
                    <p className="text-slate-400 text-xs">جلب معلومات العميل الكاملة عند بدء المكالمة</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-400 text-sm font-medium">✓ مزامنة ثنائية الاتجاه</p>
                    <p className="text-slate-400 text-xs">تحديث CRM تلقائياً بعد كل تفاعل</p>
                  </div>
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <p className="text-purple-400 text-sm font-medium">✓ ربط التفاعلات</p>
                    <p className="text-slate-400 text-xs">تسجيل كل تفاعل وربطه بسجل العميل</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Upsell/Cross-sell Identifier */}
        <TabsContent value="upsell">
          <AIUpsellCrossSellIdentifier
            customerData={{
              id: 'CUS-001',
              name: 'أحمد محمد',
              tier: 'premium',
              lifetime_value: 25000
            }}
            journeyData={{
              stages: ['awareness', 'consideration', 'purchase'],
              currentStage: 'consideration'
            }}
            crmHistory={{
              purchases: 5,
              lastPurchase: '2024-11-15',
              avgOrderValue: 5000
            }}
            onTaskCreate={(task) => {
              toast.success(`تم إنشاء مهمة: ${task.title}`);
            }}
          />
        </TabsContent>

        {/* Custom Automation Rules */}
        <TabsContent value="automation-rules">
          <CustomAutomationRulesBuilder
            onRuleSave={(rule) => {
              toast.success(`تم حفظ القاعدة: ${rule.name}`);
            }}
          />
        </TabsContent>

        {/* Personalized Agent Dashboard */}
        <TabsContent value="personal-dashboard">
          <PersonalizedAgentDashboard agentId="current-agent" />
        </TabsContent>

        {/* Realtime Agent Coaching */}
        <TabsContent value="realtime-coaching">
          <RealtimeAgentCoaching
            isCallActive={isCallActive}
            conversationTranscript={customerStatement}
            customerData={{
              name: 'أحمد محمد',
              tier: 'VIP',
              history: 'عميل منذ 3 سنوات'
            }}
            onSuggestionApplied={(suggestion) => {
              toast.success('تم تطبيق الاقتراح');
            }}
          />
        </TabsContent>

        {/* Advanced Predictive Analytics */}
        <TabsContent value="predictive">
          <AdvancedPredictiveAnalytics />
        </TabsContent>

        {/* AI Workflow Generator */}
        <TabsContent value="workflow-ai">
          <AIWorkflowGenerator
            onWorkflowSave={(workflow) => {
              toast.success(`تم حفظ سير العمل: ${workflow.name}`);
            }}
          />
        </TabsContent>

        {/* Deep Journey Analytics */}
        <TabsContent value="journey-deep">
          <DeepJourneyAnalytics
            customerId="CUS-001"
            customerData={{
              name: 'أحمد محمد',
              tier: 'VIP',
              total_interactions: 25,
              lifetime_value: 15000
            }}
          />
        </TabsContent>

        {/* Auto Repair System */}
        <TabsContent value="auto-repair">
          <AutoRepairSystem />
        </TabsContent>

        {/* Unified Omnichannel Analytics */}
        <TabsContent value="omnichannel-analytics">
          <UnifiedOmnichannelAnalytics />
        </TabsContent>

        {/* Advanced AI Training */}
        <TabsContent value="ai-training">
          <AdvancedAgentTrainingAI agentId="current-agent" />
        </TabsContent>

        {/* AI Advanced Report Generator */}
        <TabsContent value="ai-reports">
          <AIAdvancedReportGenerator />
        </TabsContent>

        {/* Enhanced Personalized Dashboard */}
        <TabsContent value="enhanced-dashboard">
          <EnhancedPersonalizedDashboard agentId="current-agent" />
        </TabsContent>

        {/* Dynamic Training Scenarios */}
        <TabsContent value="dynamic-training">
          <DynamicTrainingScenarios agentId="current-agent" />
        </TabsContent>
      </Tabs>

      {/* Feature List */}
      <Card className="mt-6 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50">
        <CardContent className="p-6">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            قدرات المنصة
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Voice AI Engine', items: ['تحويل الصوت لنص', 'تحليل المشاعر', 'كشف النبرة', 'كشف التهديدات'] },
              { title: 'AI Workflow', items: ['بناء تلقائي للخطوات', 'تنفيذ أوتوماتيكي', 'إغلاق تلقائي للتذاكر', 'تكامل مع الأنظمة'] },
              { title: 'QA Engine', items: ['تقييم تلقائي 100%', 'كشف المخالفات', 'نصائح تحسين', 'تقارير مفصلة'] },
              { title: 'Agent Helper', items: ['ردود مقترحة', 'قاعدة معرفة ذكية', 'خطوات الحل', 'تحليل الشخصية'] },
            ].map((feature, i) => (
              <div key={i} className="p-4 bg-slate-800/30 rounded-lg">
                <h4 className="text-cyan-400 font-medium mb-3">{feature.title}</h4>
                <ul className="space-y-1">
                  {feature.items.map((item, j) => (
                    <li key={j} className="text-slate-300 text-sm flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}