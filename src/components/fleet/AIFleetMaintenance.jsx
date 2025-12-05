import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, AlertTriangle, Wrench, Car, Gauge, Thermometer, Battery,
  Activity, Clock, DollarSign, TrendingUp, CheckCircle, Calendar,
  Loader2, Zap, Shield, Target, BarChart3, Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export default function AIFleetMaintenance({ vehicles = [] }) {
  const [predictions, setPredictions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analysisMutation = useMutation({
    mutationFn: async () => {
      const vehicleData = vehicles.map(v => ({
        plate: v.plate,
        driver: v.driver,
        odometer: v.odometer,
        health: v.health,
        driverScore: v.driverScore,
        violations: v.violations,
        canbus: v.canbus,
        status: v.status
      }));

      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير في الصيانة التنبؤية للأساطيل. قم بتحليل بيانات المركبات التالية وتوقع الأعطال المحتملة:

بيانات المركبات:
${JSON.stringify(vehicleData, null, 2)}

قم بتحليل:
1. بيانات CANbus (RPM، حرارة المحرك، ضغط الزيت، جهد البطارية)
2. صحة المركبة العامة
3. سلوك القيادة (المخالفات، التقييم)
4. عداد المسافات

لكل مركبة قدم:
- توقعات الأعطال المحتملة مع نسبة الاحتمال
- الأجزاء المعرضة للخطر
- توصيات الصيانة الاستباقية
- التكلفة المتوقعة للإصلاح vs الاستبدال
- الأيام المتبقية قبل العطل المتوقع
- الأولوية (critical/high/medium/low)`,
        response_json_schema: {
          type: "object",
          properties: {
            predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  vehiclePlate: { type: "string" },
                  overallHealth: { type: "number" },
                  riskLevel: { type: "string" },
                  potentialFailures: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        component: { type: "string" },
                        probability: { type: "number" },
                        daysToFailure: { type: "number" },
                        symptoms: { type: "array", items: { type: "string" } }
                      }
                    }
                  },
                  maintenanceRecommendations: { type: "array", items: { type: "string" } },
                  estimatedRepairCost: { type: "number" },
                  estimatedReplaceCost: { type: "number" },
                  priority: { type: "string" },
                  drivingBehaviorImpact: { type: "string" },
                  scheduledMaintenanceDate: { type: "string" }
                }
              }
            },
            fleetSummary: {
              type: "object",
              properties: {
                totalVehicles: { type: "number" },
                criticalCount: { type: "number" },
                highRiskCount: { type: "number" },
                estimatedMonthlySavings: { type: "number" },
                uptimeImprovement: { type: "string" }
              }
            }
          }
        }
      });
    },
    onSuccess: (data) => {
      setPredictions(data.predictions || []);
      setIsAnalyzing(false);
      toast.success(`تم تحليل ${data.predictions?.length || 0} مركبة`);
    },
    onError: () => {
      setIsAnalyzing(false);
      toast.error('فشل في التحليل');
    }
  });

  const runAnalysis = () => {
    setIsAnalyzing(true);
    analysisMutation.mutate();
  };

  const scheduleMaintenance = (prediction) => {
    toast.success(`تم جدولة صيانة للمركبة ${prediction.vehiclePlate}`);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'medium': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          الصيانة التنبؤية بالذكاء الاصطناعي
        </h3>
        <Button 
          onClick={runAnalysis} 
          disabled={isAnalyzing}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              جاري التحليل...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 ml-2" />
              تحليل الأسطول
            </>
          )}
        </Button>
      </div>

      {/* Fleet Summary */}
      {analysisMutation.data?.fleetSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <Car className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{analysisMutation.data.fleetSummary.totalVehicles}</p>
              <p className="text-slate-400 text-sm">مركبات محللة</p>
            </CardContent>
          </Card>
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{analysisMutation.data.fleetSummary.criticalCount}</p>
              <p className="text-slate-400 text-sm">حالات حرجة</p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{analysisMutation.data.fleetSummary.estimatedMonthlySavings?.toLocaleString()}</p>
              <p className="text-slate-400 text-sm">توفير شهري (ر.س)</p>
            </CardContent>
          </Card>
          <Card className="bg-cyan-500/10 border-cyan-500/30">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{analysisMutation.data.fleetSummary.uptimeImprovement}</p>
              <p className="text-slate-400 text-sm">تحسن وقت التشغيل</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Predictions */}
      {predictions.length > 0 && (
        <div className="space-y-4">
          {predictions.map((pred, i) => (
            <Card key={i} className={`border ${getPriorityColor(pred.priority)}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${
                      pred.priority === 'critical' ? 'bg-red-500/20' :
                      pred.priority === 'high' ? 'bg-amber-500/20' : 'bg-green-500/20'
                    }`}>
                      <Car className={`w-6 h-6 ${
                        pred.priority === 'critical' ? 'text-red-400' :
                        pred.priority === 'high' ? 'text-amber-400' : 'text-green-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">{pred.vehiclePlate}</p>
                      <Badge className={getPriorityColor(pred.priority)}>
                        {pred.priority === 'critical' ? 'حرج' : 
                         pred.priority === 'high' ? 'عالي' : 
                         pred.priority === 'medium' ? 'متوسط' : 'منخفض'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-400 text-sm">صحة المركبة:</span>
                      <span className={`font-bold ${pred.overallHealth >= 70 ? 'text-green-400' : pred.overallHealth >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {pred.overallHealth}%
                      </span>
                    </div>
                    <Progress value={pred.overallHealth} className="w-24 h-2" />
                  </div>
                </div>

                {/* Potential Failures */}
                {pred.potentialFailures?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-slate-400 text-sm mb-2">الأعطال المتوقعة:</p>
                    <div className="grid md:grid-cols-2 gap-2">
                      {pred.potentialFailures.map((failure, j) => (
                        <div key={j} className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-medium">{failure.component}</span>
                            <Badge className={failure.probability >= 70 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}>
                              {failure.probability}%
                            </Badge>
                          </div>
                          <p className="text-amber-400 text-sm flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {failure.daysToFailure} يوم متبقي
                          </p>
                          {failure.symptoms?.length > 0 && (
                            <p className="text-slate-500 text-xs mt-1">
                              الأعراض: {failure.symptoms.join('، ')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {pred.maintenanceRecommendations?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-slate-400 text-sm mb-2">توصيات الصيانة:</p>
                    <ul className="space-y-1">
                      {pred.maintenanceRecommendations.map((rec, j) => (
                        <li key={j} className="text-white text-sm flex items-start gap-2">
                          <Wrench className="w-3 h-3 text-cyan-400 mt-1 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cost Analysis */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                    <p className="text-green-400 font-bold">{pred.estimatedRepairCost?.toLocaleString()} ر.س</p>
                    <p className="text-slate-400 text-xs">تكلفة الإصلاح</p>
                  </div>
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center">
                    <p className="text-amber-400 font-bold">{pred.estimatedReplaceCost?.toLocaleString()} ر.س</p>
                    <p className="text-slate-400 text-xs">تكلفة الاستبدال</p>
                  </div>
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-center">
                    <p className="text-cyan-400 font-bold">{pred.scheduledMaintenanceDate}</p>
                    <p className="text-slate-400 text-xs">موعد الصيانة</p>
                  </div>
                </div>

                {/* Driving Behavior Impact */}
                {pred.drivingBehaviorImpact && (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg mb-4">
                    <p className="text-purple-400 text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      تأثير سلوك القيادة: {pred.drivingBehaviorImpact}
                    </p>
                  </div>
                )}

                <Button 
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                  onClick={() => scheduleMaintenance(pred)}
                >
                  <Calendar className="w-4 h-4 ml-2" />
                  جدولة صيانة استباقية
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {predictions.length === 0 && !isAnalyzing && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-12 text-center">
            <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">لم يتم إجراء تحليل بعد</p>
            <p className="text-slate-500 text-sm">اضغط على "تحليل الأسطول" للحصول على توقعات الصيانة</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}