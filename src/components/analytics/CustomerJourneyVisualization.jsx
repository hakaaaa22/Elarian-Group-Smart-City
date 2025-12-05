import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  MapPin, ArrowRight, Phone, Mail, MessageSquare, Facebook, Instagram,
  User, Clock, AlertTriangle, CheckCircle, XCircle, TrendingDown, Eye,
  Search, Filter, Loader2, ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

const channelConfig = {
  voice: { icon: Phone, color: 'cyan', label: 'مكالمة' },
  email: { icon: Mail, color: 'red', label: 'بريد' },
  chat: { icon: MessageSquare, color: 'green', label: 'دردشة' },
  facebook: { icon: Facebook, color: 'blue', label: 'فيسبوك' },
  instagram: { icon: Instagram, color: 'pink', label: 'انستجرام' },
};

// Sample common paths
const commonPaths = [
  { path: ['chat', 'voice', 'email'], count: 1250, avgDuration: '2.5 ساعة', conversionRate: 78, dropoffRate: 12 },
  { path: ['facebook', 'chat', 'voice'], count: 890, avgDuration: '4 ساعات', conversionRate: 65, dropoffRate: 22 },
  { path: ['email', 'voice'], count: 750, avgDuration: '1 ساعة', conversionRate: 85, dropoffRate: 8 },
  { path: ['instagram', 'chat'], count: 620, avgDuration: '30 دقيقة', conversionRate: 72, dropoffRate: 15 },
  { path: ['voice', 'email', 'chat', 'voice'], count: 340, avgDuration: '6 ساعات', conversionRate: 45, dropoffRate: 35 },
];

// Sample individual journeys
const sampleJourneys = [
  {
    customerId: 'CUS-001',
    customerName: 'أحمد محمد',
    status: 'completed',
    touchpoints: [
      { channel: 'facebook', timestamp: '2024-12-04 09:00', action: 'استفسار أولي', agent: 'سارة', sentiment: 'neutral' },
      { channel: 'chat', timestamp: '2024-12-04 09:30', action: 'متابعة', agent: 'محمد', sentiment: 'positive' },
      { channel: 'voice', timestamp: '2024-12-04 10:15', action: 'إتمام الشراء', agent: 'أحمد', sentiment: 'positive' },
    ]
  },
  {
    customerId: 'CUS-002',
    customerName: 'فاطمة علي',
    status: 'dropped',
    touchpoints: [
      { channel: 'email', timestamp: '2024-12-04 11:00', action: 'شكوى', agent: 'خالد', sentiment: 'negative' },
      { channel: 'voice', timestamp: '2024-12-04 11:30', action: 'محاولة حل', agent: 'سمير', sentiment: 'negative' },
      { channel: 'chat', timestamp: '2024-12-04 14:00', action: 'متابعة غير مرضية', agent: 'ليلى', sentiment: 'negative' },
    ]
  },
  {
    customerId: 'CUS-003',
    customerName: 'خالد عمر',
    status: 'in_progress',
    touchpoints: [
      { channel: 'instagram', timestamp: '2024-12-05 08:00', action: 'استفسار عن منتج', agent: 'نور', sentiment: 'positive' },
      { channel: 'chat', timestamp: '2024-12-05 08:45', action: 'طلب تفاصيل', agent: 'مريم', sentiment: 'neutral' },
    ]
  },
];

// Critical dropoff points
const dropoffPoints = [
  { from: 'chat', to: 'voice', rate: 35, reason: 'انتظار طويل للتحويل', severity: 'high' },
  { from: 'email', to: 'chat', rate: 28, reason: 'عدم الرد السريع', severity: 'high' },
  { from: 'voice', to: 'email', rate: 18, reason: 'تكرار المعلومات', severity: 'medium' },
  { from: 'facebook', to: 'voice', rate: 15, reason: 'صعوبة الوصول', severity: 'medium' },
];

export default function CustomerJourneyVisualization() {
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [journeyAnalysis, setJourneyAnalysis] = useState(null);

  const analyzeJourneyMutation = useMutation({
    mutationFn: async (journeyId) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل رحلة العميل التالية وقدم رؤى مفصلة:
        
معرف العميل: ${journeyId}
نقاط التماس: ${JSON.stringify(sampleJourneys.find(j => j.customerId === journeyId)?.touchpoints)}

قدم:
1. ملخص الرحلة
2. نقاط القوة في التجربة
3. نقاط الضعف ومجالات التحسين
4. توصيات للتفاعلات المستقبلية
5. احتمالية الولاء`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            loyalty_probability: { type: "number" },
            next_best_action: { type: "string" }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setJourneyAnalysis(data);
      toast.success('تم تحليل الرحلة');
    }
  });

  const filteredJourneys = sampleJourneys.filter(j => {
    if (searchQuery && !j.customerName.includes(searchQuery) && !j.customerId.includes(searchQuery)) return false;
    if (filterStatus !== 'all' && j.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3 ml-1" />مكتمل</Badge>;
      case 'dropped': return <Badge className="bg-red-500/20 text-red-400"><XCircle className="w-3 h-3 ml-1" />منقطع</Badge>;
      case 'in_progress': return <Badge className="bg-amber-500/20 text-amber-400"><Clock className="w-3 h-3 ml-1" />جاري</Badge>;
      default: return null;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'green';
      case 'negative': return 'red';
      default: return 'slate';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Common Paths */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-400" />
            المسارات الشائعة للعملاء
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {commonPaths.map((pathData, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedPath === i 
                    ? 'bg-purple-500/10 border-purple-500/50' 
                    : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                }`}
                onClick={() => setSelectedPath(selectedPath === i ? null : i)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {pathData.path.map((channel, j) => {
                      const config = channelConfig[channel] || {};
                      const Icon = config.icon || MessageSquare;
                      return (
                        <React.Fragment key={j}>
                          <div className={`p-1.5 rounded bg-${config.color || 'slate'}-500/20`}>
                            <Icon className={`w-4 h-4 text-${config.color || 'slate'}-400`} />
                          </div>
                          {j < pathData.path.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <p className="text-white font-bold">{pathData.count.toLocaleString()}</p>
                      <p className="text-slate-400 text-xs">عميل</p>
                    </div>
                    <Badge className={pathData.conversionRate >= 70 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                      {pathData.conversionRate}% تحويل
                    </Badge>
                  </div>
                </div>
                
                <AnimatePresence>
                  {selectedPath === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3 pt-3 border-t border-slate-700"
                    >
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <p className="text-slate-400 text-xs">المدة المتوسطة</p>
                          <p className="text-white font-medium">{pathData.avgDuration}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400 text-xs">معدل التحويل</p>
                          <p className="text-green-400 font-medium">{pathData.conversionRate}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400 text-xs">معدل الانقطاع</p>
                          <p className="text-red-400 font-medium">{pathData.dropoffRate}%</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dropoff Points */}
      <Card className="bg-red-500/10 border-red-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            نقاط الانقطاع الحرجة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {dropoffPoints.map((point, i) => {
              const fromCfg = channelConfig[point.from] || {};
              const toCfg = channelConfig[point.to] || {};
              return (
                <div key={i} className={`p-3 rounded-lg border ${
                  point.severity === 'high' ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`bg-${fromCfg.color || 'slate'}-500/20 text-${fromCfg.color || 'slate'}-400`}>
                      {fromCfg.label}
                    </Badge>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <Badge className={`bg-${toCfg.color || 'slate'}-500/20 text-${toCfg.color || 'slate'}-400`}>
                      {toCfg.label}
                    </Badge>
                    <Badge className={point.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}>
                      {point.rate}% انقطاع
                    </Badge>
                  </div>
                  <p className="text-slate-300 text-sm">{point.reason}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Individual Customer Journeys */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              تتبع رحلات العملاء الفردية
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث..."
                  className="bg-slate-900 border-slate-700 text-white h-8 w-40 pr-8"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white h-8 w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="in_progress">جاري</SelectItem>
                  <SelectItem value="dropped">منقطع</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {filteredJourneys.map((journey) => (
                <div
                  key={journey.customerId}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedJourney === journey.customerId
                      ? 'bg-cyan-500/10 border-cyan-500/50'
                      : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                  }`}
                  onClick={() => setSelectedJourney(selectedJourney === journey.customerId ? null : journey.customerId)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{journey.customerName}</p>
                        <p className="text-slate-400 text-xs">{journey.customerId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(journey.status)}
                      {selectedJourney === journey.customerId ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Journey Timeline Preview */}
                  <div className="flex items-center gap-1">
                    {journey.touchpoints.map((tp, i) => {
                      const config = channelConfig[tp.channel] || {};
                      const Icon = config.icon || MessageSquare;
                      return (
                        <React.Fragment key={i}>
                          <div className={`p-1 rounded bg-${config.color || 'slate'}-500/20`}>
                            <Icon className={`w-3 h-3 text-${config.color || 'slate'}-400`} />
                          </div>
                          {i < journey.touchpoints.length - 1 && (
                            <div className="w-4 h-0.5 bg-slate-700" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {selectedJourney === journey.customerId && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 pt-3 border-t border-slate-700"
                      >
                        <div className="space-y-2 mb-3">
                          {journey.touchpoints.map((tp, i) => {
                            const config = channelConfig[tp.channel] || {};
                            const Icon = config.icon || MessageSquare;
                            const sentimentColor = getSentimentColor(tp.sentiment);
                            return (
                              <div key={i} className="flex items-start gap-3 p-2 bg-slate-800/50 rounded">
                                <div className={`p-1.5 rounded bg-${config.color || 'slate'}-500/20 mt-0.5`}>
                                  <Icon className={`w-4 h-4 text-${config.color || 'slate'}-400`} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="text-white text-sm">{tp.action}</p>
                                    <Badge className={`bg-${sentimentColor}-500/20 text-${sentimentColor}-400 text-xs`}>
                                      {tp.sentiment}
                                    </Badge>
                                  </div>
                                  <p className="text-slate-400 text-xs">{tp.timestamp} • الوكيل: {tp.agent}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <Button
                          size="sm"
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          onClick={(e) => { e.stopPropagation(); analyzeJourneyMutation.mutate(journey.customerId); }}
                          disabled={analyzeJourneyMutation.isPending}
                        >
                          {analyzeJourneyMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <><Eye className="w-4 h-4 ml-1" /> تحليل الرحلة بالذكاء الاصطناعي</>
                          )}
                        </Button>

                        {journeyAnalysis && selectedJourney === journey.customerId && (
                          <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                            <p className="text-slate-300 text-sm mb-2">{journeyAnalysis.summary}</p>
                            <div className="flex items-center justify-between">
                              <Badge className="bg-cyan-500/20 text-cyan-400">
                                احتمالية الولاء: {journeyAnalysis.loyalty_probability}%
                              </Badge>
                              <p className="text-green-400 text-xs">
                                <Zap className="w-3 h-3 inline ml-1" />
                                {journeyAnalysis.next_best_action}
                              </p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}