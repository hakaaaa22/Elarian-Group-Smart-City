import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Shield, User, AlertTriangle, Brain, RefreshCw, Clock, Activity,
  Lock, Eye, FileText, Download, Settings, CheckCircle, XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const userActivities = [
  { 
    userId: 'USR-045', 
    name: 'محمد أحمد', 
    department: 'المالية',
    recentActivities: [
      { type: 'login', count: 15, normal: 8, outside_hours: 7 },
      { type: 'data_export', count: 12, normal: 3 },
      { type: 'failed_access', count: 5, normal: 1 },
    ],
    lastPasswordChange: 45,
    trainingCompleted: false,
  },
  {
    userId: 'USR-023',
    name: 'سارة علي',
    department: 'تقنية المعلومات',
    recentActivities: [
      { type: 'login', count: 22, normal: 20, outside_hours: 2 },
      { type: 'admin_access', count: 8, normal: 10 },
      { type: 'config_change', count: 3, normal: 2 },
    ],
    lastPasswordChange: 90,
    trainingCompleted: false,
  },
  {
    userId: 'USR-067',
    name: 'خالد السعيد',
    department: 'العمليات',
    recentActivities: [
      { type: 'login', count: 10, normal: 12, outside_hours: 0 },
      { type: 'data_export', count: 1, normal: 2 },
    ],
    lastPasswordChange: 15,
    trainingCompleted: true,
  },
];

export default function UserBehaviorRiskAnalysis() {
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const analyzeRisks = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في أمن المعلومات والامتثال، حلل أنماط سلوك المستخدمين التالية وحدد مخاطر الامتثال:

${userActivities.map(user => `
المستخدم: ${user.name} (${user.userId}) - ${user.department}
الأنشطة:
${user.recentActivities.map(a => `- ${a.type}: ${a.count} (الطبيعي: ${a.normal})${a.outside_hours ? `, خارج الدوام: ${a.outside_hours}` : ''}`).join('\n')}
آخر تغيير كلمة مرور: قبل ${user.lastPasswordChange} يوم
التدريبات الإلزامية: ${user.trainingCompleted ? 'مكتمل' : 'غير مكتمل'}
`).join('\n---\n')}

قدم:
1. تقييم مخاطر لكل مستخدم (0-100)
2. الأنماط السلوكية المشبوهة
3. احتمالية انتهاك الامتثال المستقبلي
4. إجراءات وقائية مقترحة
5. تنبيهات فورية إن وجدت`,
        response_json_schema: {
          type: "object",
          properties: {
            userRisks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  userId: { type: "string" },
                  riskScore: { type: "number" },
                  riskLevel: { type: "string" },
                  suspiciousPatterns: { type: "array", items: { type: "string" } },
                  complianceViolationProbability: { type: "number" },
                  preventiveActions: { type: "array", items: { type: "string" } }
                }
              }
            },
            immediateAlerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  userId: { type: "string" },
                  alertType: { type: "string" },
                  severity: { type: "string" },
                  description: { type: "string" },
                  recommendedAction: { type: "string" }
                }
              }
            },
            overallComplianceHealth: { type: "number" },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setRiskAnalysis(data);
      if (data.immediateAlerts?.length > 0) {
        toast.warning(`⚠️ تم اكتشاف ${data.immediateAlerts.length} تنبيهات فورية`);
      } else {
        toast.success('تم تحليل مخاطر السلوك');
      }
    }
  });

  const getRiskColor = (score) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-green-400';
  };

  const getRiskBgColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': case 'عالي': return 'bg-red-500/20 border-red-500/30';
      case 'medium': case 'متوسط': return 'bg-amber-500/20 border-amber-500/30';
      default: return 'bg-green-500/20 border-green-500/30';
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          تحليل مخاطر سلوك المستخدمين
        </h3>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => analyzeRisks.mutate()} disabled={analyzeRisks.isPending}>
          {analyzeRisks.isPending ? <RefreshCw className="w-4 h-4 ml-1 animate-spin" /> : <Brain className="w-4 h-4 ml-1" />}
          تحليل المخاطر
        </Button>
      </div>

      {/* Users Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        {userActivities.map(user => {
          const userRisk = riskAnalysis?.userRisks?.find(r => r.userId === user.userId);
          return (
            <Card 
              key={user.userId} 
              className={`cursor-pointer transition-all hover:border-purple-500/50 ${userRisk ? getRiskBgColor(userRisk.riskLevel) : 'bg-slate-800/50 border-slate-700'}`}
              onClick={() => setSelectedUser(user.userId)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-slate-400 text-xs">{user.department}</p>
                  </div>
                </div>

                {userRisk && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400 text-xs">مستوى الخطورة</span>
                      <span className={`font-bold ${getRiskColor(userRisk.riskScore)}`}>{userRisk.riskScore}%</span>
                    </div>
                    <Progress value={userRisk.riskScore} className="h-2" />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">كلمة المرور</span>
                    <Badge className={user.lastPasswordChange > 60 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                      {user.lastPasswordChange} يوم
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">التدريب</span>
                    {user.trainingCompleted ? 
                      <CheckCircle className="w-4 h-4 text-green-400" /> : 
                      <XCircle className="w-4 h-4 text-red-400" />
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {riskAnalysis && (
        <>
          {/* Overall Health */}
          <Card className={`border ${riskAnalysis.overallComplianceHealth >= 70 ? 'bg-green-500/10 border-green-500/30' : riskAnalysis.overallComplianceHealth >= 40 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <CardContent className="p-4 text-center">
              <p className="text-4xl font-bold text-white">{riskAnalysis.overallComplianceHealth}%</p>
              <p className="text-slate-400">صحة الامتثال العامة</p>
            </CardContent>
          </Card>

          {/* Immediate Alerts */}
          {riskAnalysis.immediateAlerts?.length > 0 && (
            <Card className="bg-red-500/10 border-red-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-400 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  تنبيهات فورية ({riskAnalysis.immediateAlerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {riskAnalysis.immediateAlerts.map((alert, i) => (
                    <div key={i} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium">{alert.alertType}</span>
                        <Badge className="bg-red-500/20 text-red-400">{alert.severity}</Badge>
                      </div>
                      <p className="text-slate-300 text-sm">{alert.description}</p>
                      <p className="text-cyan-400 text-xs mt-1">الإجراء: {alert.recommendedAction}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed User Risks */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">تفاصيل مخاطر المستخدمين</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  {riskAnalysis.userRisks?.map((risk, i) => {
                    const user = userActivities.find(u => u.userId === risk.userId);
                    return (
                      <div key={i} className={`p-4 rounded-lg border ${getRiskBgColor(risk.riskLevel)}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-slate-400" />
                            <span className="text-white font-medium">{user?.name || risk.userId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${getRiskColor(risk.riskScore)}`}>{risk.riskScore}%</span>
                            <Badge className={getRiskBgColor(risk.riskLevel)}>{risk.riskLevel}</Badge>
                          </div>
                        </div>

                        {risk.suspiciousPatterns?.length > 0 && (
                          <div className="mb-3">
                            <p className="text-slate-400 text-xs mb-1">الأنماط المشبوهة:</p>
                            <div className="flex flex-wrap gap-1">
                              {risk.suspiciousPatterns.map((pattern, j) => (
                                <Badge key={j} className="bg-amber-500/20 text-amber-400 text-xs">{pattern}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-slate-400 text-xs">احتمالية الانتهاك:</span>
                          <Progress value={risk.complianceViolationProbability} className="flex-1 h-2" />
                          <span className={getRiskColor(risk.complianceViolationProbability)}>{risk.complianceViolationProbability}%</span>
                        </div>

                        {risk.preventiveActions?.length > 0 && (
                          <div className="p-2 bg-green-500/10 rounded">
                            <p className="text-green-400 text-xs mb-1">الإجراءات الوقائية:</p>
                            <ul className="space-y-1">
                              {risk.preventiveActions.map((action, j) => (
                                <li key={j} className="text-white text-xs flex items-start gap-1">
                                  <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {riskAnalysis.recommendations?.length > 0 && (
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">التوصيات العامة</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {riskAnalysis.recommendations.map((rec, i) => (
                    <li key={i} className="text-white text-sm flex items-start gap-2">
                      <Settings className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!riskAnalysis && (
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="py-12 text-center">
            <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">اضغط "تحليل المخاطر" لتحليل سلوك المستخدمين</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}