import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Users, Crown, AlertTriangle, TrendingUp, Heart, Target,
  Brain, Sparkles, Loader2, Download, PieChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#3b82f6'];

const segmentIcons = {
  'high_value_loyalists': { icon: Crown, color: 'amber' },
  'at_risk_detractors': { icon: AlertTriangle, color: 'red' },
  'growth_potential': { icon: TrendingUp, color: 'green' },
  'new_customers': { icon: Heart, color: 'pink' },
  'dormant': { icon: Users, color: 'slate' }
};

export default function CustomerSegmentAnalysis() {
  const [segments, setSegments] = useState(null);

  const analyzeSegmentsMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل قاعدة العملاء وتقسيمها إلى شرائح ذكية:

1. العملاء المخلصون عالي القيمة (High-Value Loyalists)
2. العملاء المعرضون للمغادرة (At-Risk Detractors)
3. العملاء ذوو إمكانية النمو (Growth Potential)
4. العملاء الجدد (New Customers)
5. العملاء الخاملون (Dormant)

لكل شريحة قدم: الحجم، الخصائص، فرص المشاركة، والتوصيات.`,
        response_json_schema: {
          type: "object",
          properties: {
            segments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  count: { type: "number" },
                  percentage: { type: "number" },
                  avg_value: { type: "number" },
                  characteristics: { type: "array", items: { type: "string" } },
                  engagement_opportunities: { type: "array", items: { type: "string" } },
                  recommended_actions: { type: "array", items: { type: "string" } },
                  key_metrics: {
                    type: "object",
                    properties: {
                      satisfaction: { type: "number" },
                      churn_risk: { type: "number" },
                      purchase_frequency: { type: "number" }
                    }
                  }
                }
              }
            },
            summary: {
              type: "object",
              properties: {
                total_customers: { type: "number" },
                total_value: { type: "number" },
                health_score: { type: "number" }
              }
            },
            insights: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setSegments(data);
      toast.success('تم تحليل شرائح العملاء');
    }
  });

  const pieData = segments?.segments?.map(s => ({
    name: s.name,
    value: s.percentage
  })) || [];

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h4 className="text-white font-bold">تحليل شرائح العملاء</h4>
            <p className="text-slate-400 text-xs">AI Customer Segmentation</p>
          </div>
        </div>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => analyzeSegmentsMutation.mutate()}
          disabled={analyzeSegmentsMutation.isPending}
        >
          {analyzeSegmentsMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <><Brain className="w-4 h-4 ml-2" /> تحليل الشرائح</>
          )}
        </Button>
      </div>

      {segments && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-white">{segments.summary?.total_customers?.toLocaleString()}</p>
                <p className="text-slate-400 text-xs">إجمالي العملاء</p>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-white">{segments.summary?.total_value?.toLocaleString()} ر.س</p>
                <p className="text-slate-400 text-xs">القيمة الإجمالية</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-white">{segments.summary?.health_score}%</p>
                <p className="text-slate-400 text-xs">صحة قاعدة العملاء</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Pie Chart */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">توزيع الشرائح</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${value}%`}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Segments List */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-4">
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {segments.segments?.map((segment, i) => {
                      const config = segmentIcons[segment.id] || { icon: Users, color: 'slate' };
                      const Icon = config.icon;
                      return (
                        <div key={i} className={`p-2 bg-${config.color}-500/10 border border-${config.color}-500/30 rounded-lg`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 text-${config.color}-400`} />
                              <span className="text-white text-sm font-medium">{segment.name}</span>
                            </div>
                            <Badge className="bg-slate-600 text-xs">{segment.count}</Badge>
                          </div>
                          <Progress value={segment.percentage} className="h-1 mt-2" />
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Segment Details */}
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {segments.segments?.map((segment, i) => {
                const config = segmentIcons[segment.id] || { icon: Users, color: 'slate' };
                const Icon = config.icon;
                return (
                  <Card key={i} className={`bg-${config.color}-500/10 border-${config.color}-500/30`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className={`w-5 h-5 text-${config.color}-400`} />
                        <span className="text-white font-bold">{segment.name}</span>
                        <Badge className="bg-slate-600">{segment.count} عميل ({segment.percentage}%)</Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-3 mb-3">
                        <div className="p-2 bg-slate-900/50 rounded text-center">
                          <p className="text-white font-bold">{segment.key_metrics?.satisfaction}%</p>
                          <p className="text-slate-400 text-xs">الرضا</p>
                        </div>
                        <div className="p-2 bg-slate-900/50 rounded text-center">
                          <p className="text-white font-bold">{segment.key_metrics?.churn_risk}%</p>
                          <p className="text-slate-400 text-xs">خطر المغادرة</p>
                        </div>
                        <div className="p-2 bg-slate-900/50 rounded text-center">
                          <p className="text-white font-bold">{segment.avg_value?.toLocaleString()}</p>
                          <p className="text-slate-400 text-xs">متوسط القيمة</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-slate-400 text-xs mb-1">فرص المشاركة:</p>
                          <div className="flex flex-wrap gap-1">
                            {segment.engagement_opportunities?.map((opp, j) => (
                              <Badge key={j} variant="outline" className="text-xs border-slate-600">{opp}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}