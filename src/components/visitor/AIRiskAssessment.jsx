import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Shield, AlertTriangle, CheckCircle, XCircle, TrendingUp,
  User, Building2, Clock, FileText, Eye, RefreshCw, Zap, Target,
  AlertOctagon, Activity, BarChart3, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const riskFactors = [
  { id: 'history', name: 'السجل السابق', weight: 0.25 },
  { id: 'threat_intel', name: 'معلومات التهديد', weight: 0.30 },
  { id: 'behavior', name: 'أنماط السلوك', weight: 0.20 },
  { id: 'access_pattern', name: 'نمط الوصول', weight: 0.15 },
  { id: 'verification', name: 'التحقق من الهوية', weight: 0.10 },
];

const mockVisitorRisks = [
  {
    id: 1,
    name: 'أحمد محمد السالم',
    company: 'شركة التقنية المتقدمة',
    riskScore: 15,
    riskLevel: 'low',
    factors: { history: 10, threat_intel: 5, behavior: 20, access_pattern: 15, verification: 10 },
    flags: [],
    recommendation: 'الموافقة التلقائية',
    lastVisit: '2025-01-10',
    totalVisits: 12
  },
  {
    id: 2,
    name: 'سارة خالد العمري',
    company: 'مؤسسة البناء الحديث',
    riskScore: 45,
    riskLevel: 'medium',
    factors: { history: 30, threat_intel: 40, behavior: 50, access_pattern: 60, verification: 20 },
    flags: ['تجاوز وقت سابق', 'وصول لمناطق غير مصرح بها'],
    recommendation: 'مراجعة يدوية',
    lastVisit: '2025-01-12',
    totalVisits: 5
  },
  {
    id: 3,
    name: 'محمد علي الفهد',
    company: 'شركة التوريدات',
    riskScore: 78,
    riskLevel: 'high',
    factors: { history: 80, threat_intel: 90, behavior: 70, access_pattern: 75, verification: 60 },
    flags: ['تطابق جزئي مع القائمة السوداء', 'سلوك مشبوه مسجل', 'تناقض في بيانات الهوية'],
    recommendation: 'رفض أو تصعيد للإدارة',
    lastVisit: '2025-01-05',
    totalVisits: 2
  },
];

const threatIntelligence = [
  { source: 'قاعدة بيانات وطنية', status: 'connected', lastSync: '2025-01-15 10:00' },
  { source: 'نظام LPR المركزي', status: 'connected', lastSync: '2025-01-15 10:30' },
  { source: 'قائمة الحظر الداخلية', status: 'connected', lastSync: '2025-01-15 10:45' },
  { source: 'شبكة التهديدات الإقليمية', status: 'warning', lastSync: '2025-01-14 22:00' },
];

export default function AIRiskAssessment() {
  const [visitors, setVisitors] = useState(mockVisitorRisks);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getRiskConfig = (level) => {
    const config = {
      low: { color: 'green', label: 'منخفض', icon: CheckCircle },
      medium: { color: 'amber', label: 'متوسط', icon: AlertTriangle },
      high: { color: 'red', label: 'عالي', icon: AlertOctagon },
      critical: { color: 'purple', label: 'حرج', icon: XCircle },
    };
    return config[level] || config.low;
  };

  const runAnalysis = async (visitorId) => {
    setIsAnalyzing(true);
    await new Promise(r => setTimeout(r, 2000));
    toast.success('تم تحديث تحليل المخاطر');
    setIsAnalyzing(false);
  };

  const stats = {
    total: visitors.length,
    low: visitors.filter(v => v.riskLevel === 'low').length,
    medium: visitors.filter(v => v.riskLevel === 'medium').length,
    high: visitors.filter(v => v.riskLevel === 'high').length,
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20"
          >
            <Brain className="w-7 h-7 text-purple-400" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-white">تقييم المخاطر بالذكاء الاصطناعي</h3>
            <p className="text-slate-500 text-sm">تحليل متقدم للزوار بناءً على البيانات التاريخية ومعلومات التهديد</p>
          </div>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => runAnalysis()}>
          {isAnalyzing ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <RefreshCw className="w-4 h-4 ml-2" />}
          تحديث التحليل
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <User className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-slate-500 text-sm">إجمالي التقييمات</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{stats.low}</p>
              <p className="text-slate-500 text-sm">منخفض المخاطر</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{stats.medium}</p>
              <p className="text-slate-500 text-sm">متوسط المخاطر</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertOctagon className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{stats.high}</p>
              <p className="text-slate-500 text-sm">عالي المخاطر</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Visitor Risk List */}
        <div className="lg:col-span-2 space-y-3">
          {visitors.map((visitor) => {
            const riskConfig = getRiskConfig(visitor.riskLevel);
            const RiskIcon = riskConfig.icon;
            return (
              <motion.div
                key={visitor.id}
                whileHover={{ scale: 1.01 }}
                className={`p-4 rounded-xl border cursor-pointer transition-all bg-slate-800/30 hover:bg-slate-800/50 ${
                  visitor.riskLevel === 'high' ? 'border-red-500/30' : 
                  visitor.riskLevel === 'medium' ? 'border-amber-500/30' : 'border-slate-700/50'
                }`}
                onClick={() => setSelectedVisitor(visitor)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 bg-gradient-to-br from-purple-500 to-cyan-500">
                      <AvatarFallback className="bg-transparent text-white">
                        {visitor.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-white font-bold">{visitor.name}</h4>
                      <p className="text-slate-500 text-sm">{visitor.company}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`bg-${riskConfig.color}-500/20 text-${riskConfig.color}-400`}>
                          <RiskIcon className="w-3 h-3 ml-1" />
                          {riskConfig.label}
                        </Badge>
                        <span className="text-slate-500 text-xs">
                          {visitor.totalVisits} زيارة سابقة
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className={`text-3xl font-bold text-${riskConfig.color}-400`}>
                      {visitor.riskScore}%
                    </div>
                    <p className="text-slate-500 text-xs">نقاط المخاطر</p>
                  </div>
                </div>

                {/* Risk Factors Bar */}
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {riskFactors.map(factor => (
                    <div key={factor.id} className="text-center">
                      <Progress 
                        value={visitor.factors[factor.id]} 
                        className="h-2 mb-1"
                      />
                      <span className="text-slate-500 text-xs">{factor.name.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>

                {/* Flags */}
                {visitor.flags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {visitor.flags.map((flag, i) => (
                      <Badge key={i} variant="outline" className="border-red-500/50 text-red-400 text-xs">
                        <AlertTriangle className="w-3 h-3 ml-1" />
                        {flag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Recommendation */}
                <div className={`mt-3 p-2 rounded-lg bg-${riskConfig.color}-500/10 border border-${riskConfig.color}-500/20`}>
                  <p className={`text-${riskConfig.color}-400 text-sm flex items-center gap-2`}>
                    <Zap className="w-4 h-4" />
                    التوصية: {visitor.recommendation}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Threat Intelligence */}
        <Card className="bg-slate-800/30 border-slate-700/50 h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-pink-400" />
              مصادر معلومات التهديد
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {threatIntelligence.map((source, i) => (
              <div key={i} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm">{source.source}</span>
                  <Badge className={source.status === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                    {source.status === 'connected' ? 'متصل' : 'تحذير'}
                  </Badge>
                </div>
                <p className="text-slate-500 text-xs">آخر مزامنة: {source.lastSync}</p>
              </div>
            ))}

            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 font-medium text-sm">محرك AI</span>
              </div>
              <p className="text-slate-400 text-xs">
                يحلل البيانات من جميع المصادر لتقييم مستوى المخاطر بدقة عالية
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Activity className="w-3 h-3 text-green-400 animate-pulse" />
                <span className="text-green-400 text-xs">نشط ويعمل</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedVisitor} onOpenChange={() => setSelectedVisitor(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              تحليل تفصيلي - {selectedVisitor?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedVisitor && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                {riskFactors.map(factor => (
                  <div key={factor.id} className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">{factor.name}</span>
                      <span className="text-white font-bold">{selectedVisitor.factors[factor.id]}%</span>
                    </div>
                    <Progress value={selectedVisitor.factors[factor.id]} className="h-2" />
                    <p className="text-slate-500 text-xs mt-1">وزن العامل: {factor.weight * 100}%</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 ml-2" />
                  الموافقة
                </Button>
                <Button variant="outline" className="flex-1 border-amber-500/50 text-amber-400">
                  <Eye className="w-4 h-4 ml-2" />
                  مراجعة يدوية
                </Button>
                <Button variant="outline" className="flex-1 border-red-500/50 text-red-400">
                  <XCircle className="w-4 h-4 ml-2" />
                  رفض
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}