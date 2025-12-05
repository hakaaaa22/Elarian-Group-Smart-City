import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Shield, Zap, CheckCircle, AlertTriangle, FileText, Loader2, Play,
  Target, Activity, Bell, Eye, Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export default function AIAutomatedThreatResponse({ threat }) {
  const [response, setResponse] = useState(null);

  const respondToThreatMutation = useMutation({
    mutationFn: async (threatData) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل التهديد التالي ونفذ استجابة تلقائية:

التهديد: ${threatData.name}
الخطورة: ${threatData.severity}
النوع: ${threatData.type}

قدم:
1. استراتيجية التخفيف التلقائية
2. تقرير الحادث
3. خطوات التحقيق الإضافية`,
        response_json_schema: {
          type: "object",
          properties: {
            automated_actions: { type: "array", items: { type: "object", properties: { action: { type: "string" }, status: { type: "string" }, timestamp: { type: "string" } } } },
            incident_report: {
              type: "object",
              properties: {
                summary: { type: "string" },
                impact_assessment: { type: "string" },
                response_taken: { type: "string" }
              }
            },
            investigation_steps: { type: "array", items: { type: "string" } },
            manual_intervention_needed: { type: "boolean" },
            complexity_level: { type: "string" }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setResponse(data);
      toast.success('تم تنفيذ الاستجابة التلقائية');
    }
  });

  useEffect(() => {
    if (threat) {
      respondToThreatMutation.mutate(threat);
    }
  }, [threat]);

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-red-400" />
        <h5 className="text-white font-bold">الاستجابة التلقائية للتهديدات</h5>
      </div>

      {respondToThreatMutation.isPending && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 text-red-400 mx-auto mb-3 animate-spin" />
            <p className="text-slate-300">جاري تحليل التهديد وتنفيذ الاستجابة...</p>
          </CardContent>
        </Card>
      )}

      {response && (
        <>
          <Card className="bg-green-500/10 border-green-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-400" />
                الإجراءات المنفذة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {response.automated_actions?.map((action, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                    <span className="text-slate-300 text-sm">{action.action}</span>
                    <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3 ml-1" />{action.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                تقرير الحادث
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm mb-2">{response.incident_report?.summary}</p>
              <p className="text-amber-400 text-xs">التأثير: {response.incident_report?.impact_assessment}</p>
            </CardContent>
          </Card>

          {response.manual_intervention_needed && (
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-400 font-medium">تدخل يدوي مطلوب</span>
                </div>
                <div className="space-y-1">
                  {response.investigation_steps?.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-amber-400">{i + 1}.</span>
                      {step}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}