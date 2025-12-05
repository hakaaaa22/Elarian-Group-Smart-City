import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Phone, Mic, Brain, RefreshCw, CheckCircle, AlertTriangle, TrendingUp,
  TrendingDown, Play, Pause, Volume2, FileText, Star, Target, MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { toast } from 'sonner';

const callSamples = [
  { id: 'CALL-001', agent: 'سارة أحمد', customer: 'أحمد محمد', duration: '5:32', date: '2024-12-04', status: 'pending' },
  { id: 'CALL-002', agent: 'محمد فهد', customer: 'فاطمة علي', duration: '8:15', date: '2024-12-04', status: 'analyzed' },
  { id: 'CALL-003', agent: 'ليلى حسن', customer: 'خالد السعيد', duration: '3:45', date: '2024-12-03', status: 'pending' },
  { id: 'CALL-004', agent: 'سارة أحمد', customer: 'نورة العتيبي', duration: '6:20', date: '2024-12-03', status: 'analyzed' },
  { id: 'CALL-005', agent: 'عمر خالد', customer: 'عبدالله الشمري', duration: '12:10', date: '2024-12-02', status: 'pending' },
];

const qualityTrends = [
  { week: 'أسبوع 1', tone: 85, script: 90, resolution: 88, overall: 88 },
  { week: 'أسبوع 2', tone: 87, script: 88, resolution: 92, overall: 89 },
  { week: 'أسبوع 3', tone: 90, script: 92, resolution: 90, overall: 91 },
  { week: 'أسبوع 4', tone: 88, script: 94, resolution: 95, overall: 92 },
];

const agentQualityScores = [
  { name: 'سارة أحمد', tone: 92, script: 95, resolution: 94, empathy: 96, overall: 94 },
  { name: 'محمد فهد', tone: 88, script: 90, resolution: 85, empathy: 87, overall: 88 },
  { name: 'ليلى حسن', tone: 95, script: 93, resolution: 97, empathy: 98, overall: 96 },
  { name: 'عمر خالد', tone: 82, script: 85, resolution: 80, empathy: 83, overall: 83 },
];

export default function CallQualityMonitoring() {
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [analyzingCall, setAnalyzingCall] = useState(null);
  const [analysisResults, setAnalysisResults] = useState({});

  const analyzeCall = useMutation({
    mutationFn: async (call) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في مراقبة جودة مراكز الاتصال، قم بتحليل المكالمة التالية:

معرف المكالمة: ${call.id}
الوكيل: ${call.agent}
العميل: ${call.customer}
المدة: ${call.duration}

قم بتقييم المكالمة بناءً على المعايير التالية (من 0-100):
1. نبرة الصوت والاحترافية
2. الالتزام بالنص والإجراءات
3. حل المشكلة بفعالية
4. التعاطف مع العميل
5. وضوح التواصل

قدم أيضاً:
- ملخص للمكالمة
- نقاط القوة
- نقاط التحسين
- توصيات تدريبية`,
        response_json_schema: {
          type: "object",
          properties: {
            scores: {
              type: "object",
              properties: {
                tone: { type: "number" },
                scriptAdherence: { type: "number" },
                problemResolution: { type: "number" },
                empathy: { type: "number" },
                clarity: { type: "number" },
                overall: { type: "number" }
              }
            },
            summary: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            trainingRecommendations: { type: "array", items: { type: "string" } },
            sentiment: { type: "string" },
            complianceIssues: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data, call) => {
      setAnalysisResults(prev => ({ ...prev, [call.id]: data }));
      setAnalyzingCall(null);
      toast.success(`تم تحليل المكالمة ${call.id}`);
    }
  });

  const handleAnalyze = (call) => {
    setAnalyzingCall(call.id);
    analyzeCall.mutate(call);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 90) return 'bg-green-500/20 border-green-500/30';
    if (score >= 75) return 'bg-amber-500/20 border-amber-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const filteredAgents = selectedAgent === 'all' 
    ? agentQualityScores 
    : agentQualityScores.filter(a => a.name === selectedAgent);

  const radarData = filteredAgents[0] ? [
    { metric: 'نبرة الصوت', value: filteredAgents[0].tone },
    { metric: 'الالتزام بالنص', value: filteredAgents[0].script },
    { metric: 'حل المشكلة', value: filteredAgents[0].resolution },
    { metric: 'التعاطف', value: filteredAgents[0].empathy },
  ] : [];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Mic className="w-5 h-5 text-purple-400" />
          مراقبة جودة المكالمات
        </h3>
        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
          <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="الوكيل" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">جميع الوكلاء</SelectItem>
            {agentQualityScores.map(a => <SelectItem key={a.name} value={a.name}>{a.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Quality KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'نبرة الصوت', value: 89, icon: Volume2, color: 'cyan' },
          { label: 'الالتزام بالنص', value: 92, icon: FileText, color: 'green' },
          { label: 'حل المشكلة', value: 90, icon: CheckCircle, color: 'purple' },
          { label: 'التعاطف', value: 91, icon: MessageSquare, color: 'amber' },
          { label: 'المتوسط العام', value: 91, icon: Star, color: 'pink' },
        ].map(kpi => (
          <Card key={kpi.label} className={`bg-${kpi.color}-500/10 border-${kpi.color}-500/30`}>
            <CardContent className="p-3 text-center">
              <kpi.icon className={`w-5 h-5 text-${kpi.color}-400 mx-auto mb-1`} />
              <p className={`text-2xl font-bold ${getScoreColor(kpi.value)}`}>{kpi.value}%</p>
              <p className="text-slate-400 text-xs">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quality Trends */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">اتجاهات الجودة الأسبوعية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={qualityTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[70, 100]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="tone" stroke="#22d3ee" strokeWidth={2} name="نبرة الصوت" />
                  <Line type="monotone" dataKey="script" stroke="#22c55e" strokeWidth={2} name="الالتزام بالنص" />
                  <Line type="monotone" dataKey="resolution" stroke="#a855f7" strokeWidth={2} name="حل المشكلة" />
                  <Line type="monotone" dataKey="overall" stroke="#f59e0b" strokeWidth={2} name="المتوسط" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Agent Radar Chart */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">
              تحليل الأداء {selectedAgent !== 'all' ? `- ${selectedAgent}` : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" />
                  <Radar name="الأداء" dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.4} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Agent Comparison */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">مقارنة جودة الوكلاء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentQualityScores} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={80} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="overall" fill="#a855f7" name="الجودة الكلية" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Call Samples for Analysis */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Phone className="w-4 h-4 text-cyan-400" />
              عينات المكالمات للتحليل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {callSamples.map(call => (
                  <div key={call.id} className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-white font-medium text-sm">{call.id}</p>
                        <p className="text-slate-400 text-xs">{call.agent} • {call.duration}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {analysisResults[call.id] ? (
                          <Badge className={getScoreBg(analysisResults[call.id].scores?.overall || 0)}>
                            {analysisResults[call.id].scores?.overall || 0}%
                          </Badge>
                        ) : (
                          <Badge className={call.status === 'analyzed' ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-300'}>
                            {call.status === 'analyzed' ? 'تم التحليل' : 'معلق'}
                          </Badge>
                        )}
                        <Button 
                          size="sm" 
                          className="bg-purple-600 hover:bg-purple-700 h-7"
                          onClick={() => handleAnalyze(call)}
                          disabled={analyzingCall === call.id}
                        >
                          {analyzingCall === call.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Brain className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Analysis Results */}
                    {analysisResults[call.id] && (
                      <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <div className="grid grid-cols-5 gap-2 mb-3">
                          {[
                            { label: 'نبرة', value: analysisResults[call.id].scores?.tone },
                            { label: 'نص', value: analysisResults[call.id].scores?.scriptAdherence },
                            { label: 'حل', value: analysisResults[call.id].scores?.problemResolution },
                            { label: 'تعاطف', value: analysisResults[call.id].scores?.empathy },
                            { label: 'وضوح', value: analysisResults[call.id].scores?.clarity },
                          ].map(s => (
                            <div key={s.label} className="text-center">
                              <p className={`text-sm font-bold ${getScoreColor(s.value || 0)}`}>{s.value || 0}</p>
                              <p className="text-slate-500 text-[10px]">{s.label}</p>
                            </div>
                          ))}
                        </div>
                        <p className="text-slate-300 text-xs mb-2">{analysisResults[call.id].summary}</p>
                        {analysisResults[call.id].improvements?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {analysisResults[call.id].improvements.slice(0, 2).map((imp, i) => (
                              <Badge key={i} className="bg-amber-500/20 text-amber-400 text-xs">{imp}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Agent Quality Details */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">تفاصيل جودة الوكلاء</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {agentQualityScores.map(agent => (
              <div key={agent.name} className={`p-4 rounded-lg border ${getScoreBg(agent.overall)}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-medium">{agent.name}</p>
                  <p className={`text-2xl font-bold ${getScoreColor(agent.overall)}`}>{agent.overall}%</p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'نبرة الصوت', value: agent.tone },
                    { label: 'الالتزام بالنص', value: agent.script },
                    { label: 'حل المشكلة', value: agent.resolution },
                    { label: 'التعاطف', value: agent.empathy },
                  ].map(metric => (
                    <div key={metric.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{metric.label}</span>
                        <span className={getScoreColor(metric.value)}>{metric.value}%</span>
                      </div>
                      <Progress value={metric.value} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}