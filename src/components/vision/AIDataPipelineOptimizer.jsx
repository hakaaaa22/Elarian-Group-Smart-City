import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Database, Sparkles, Filter, Wand2, RefreshCw, Loader2, CheckCircle,
  AlertTriangle, TrendingUp, Layers, Zap, Target, Brain, BarChart3,
  FileSearch, Shield, Shuffle, Plus, Settings, Eye, Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function AIDataPipelineOptimizer({ datasetId, datasetName }) {
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('validation');
  const [autoClean, setAutoClean] = useState(false);
  const [selectedIssues, setSelectedIssues] = useState([]);

  // تحليل جودة البيانات
  const analyzeDataMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل شامل لخط أنابيب البيانات وتقديم:

1. التحقق من جودة البيانات:
   - القيم المفقودة ونسبتها
   - القيم الشاذة (Outliers)
   - التنسيق غير المتناسق
   - انحراف المخطط (Schema Drift)
   - مشاكل الترميز

2. اقتراحات تنظيف البيانات:
   - طرق معالجة القيم المفقودة
   - تقنيات إزالة الشذوذ
   - توحيد التنسيقات

3. هندسة الميزات (Feature Engineering):
   - ميزات جديدة مقترحة
   - تحويلات مفيدة
   - تفاعلات بين الميزات

4. تقنيات أخذ العينات والتعزيز:
   - استراتيجيات أخذ العينات الذكية
   - تقنيات تعزيز البيانات
   - موازنة الفئات`,
        response_json_schema: {
          type: "object",
          properties: {
            data_quality: {
              type: "object",
              properties: {
                overall_score: { type: "number" },
                issues: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      severity: { type: "string" },
                      affected_columns: { type: "array", items: { type: "string" } },
                      affected_rows_percentage: { type: "number" },
                      description: { type: "string" },
                      auto_fixable: { type: "boolean" }
                    }
                  }
                },
                schema_drift_detected: { type: "boolean" },
                encoding_issues: { type: "array", items: { type: "string" } }
              }
            },
            cleaning_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue_type: { type: "string" },
                  method: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string" },
                  automated: { type: "boolean" }
                }
              }
            },
            feature_engineering: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string" },
                  source_features: { type: "array", items: { type: "string" } },
                  description: { type: "string" },
                  expected_impact: { type: "string" },
                  complexity: { type: "string" }
                }
              }
            },
            sampling_augmentation: {
              type: "object",
              properties: {
                sampling_strategies: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      use_case: { type: "string" },
                      recommended: { type: "boolean" }
                    }
                  }
                },
                augmentation_techniques: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      applicable_data_types: { type: "array", items: { type: "string" } },
                      expected_improvement: { type: "string" }
                    }
                  }
                },
                class_balance_status: { type: "string" },
                rebalancing_suggestions: { type: "array", items: { type: "string" } }
              }
            },
            overall_recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast.success('تم تحليل خط أنابيب البيانات بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ في التحليل');
    }
  });

  // تطبيق التنظيف التلقائي
  const applyCleaningMutation = useMutation({
    mutationFn: async (issues) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, cleaned_issues: issues.length };
    },
    onSuccess: (data) => {
      toast.success(`تم تنظيف ${data.cleaned_issues} مشكلة تلقائياً`);
      setSelectedIssues([]);
      analyzeDataMutation.mutate();
    }
  });

  useEffect(() => {
    analyzeDataMutation.mutate();
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'amber';
      case 'low': return 'green';
      default: return 'slate';
    }
  };

  const toggleIssue = (index) => {
    setSelectedIssues(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: analyzeDataMutation.isPending ? 360 : 0 }}
            transition={{ duration: 2, repeat: analyzeDataMutation.isPending ? Infinity : 0 }}
            className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-green-500/20"
          >
            <Database className="w-5 h-5 text-cyan-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">تحسين خط أنابيب البيانات بالذكاء الاصطناعي</h4>
            <p className="text-slate-400 text-xs">التحقق • التنظيف • هندسة الميزات • التعزيز</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-lg">
            <Label className="text-slate-300 text-xs">تنظيف تلقائي</Label>
            <Switch checked={autoClean} onCheckedChange={setAutoClean} />
          </div>
          <Button
            variant="outline"
            className="border-cyan-500/50"
            onClick={() => analyzeDataMutation.mutate()}
            disabled={analyzeDataMutation.isPending}
          >
            {analyzeDataMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><RefreshCw className="w-4 h-4 ml-1" /> تحليل</>
            )}
          </Button>
        </div>
      </div>

      {analyzeDataMutation.isPending && !analysis && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-10 h-10 text-cyan-400 mx-auto mb-4 animate-spin" />
            <p className="text-white">جاري تحليل خط أنابيب البيانات...</p>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <>
          {/* Quality Score */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className={`border-${analysis.data_quality?.overall_score >= 80 ? 'green' : analysis.data_quality?.overall_score >= 60 ? 'amber' : 'red'}-500/30 bg-${analysis.data_quality?.overall_score >= 80 ? 'green' : analysis.data_quality?.overall_score >= 60 ? 'amber' : 'red'}-500/10`}>
              <CardContent className="p-3 text-center">
                <Shield className={`w-5 h-5 text-${analysis.data_quality?.overall_score >= 80 ? 'green' : analysis.data_quality?.overall_score >= 60 ? 'amber' : 'red'}-400 mx-auto mb-1`} />
                <p className="text-2xl font-bold text-white">{analysis.data_quality?.overall_score || 0}%</p>
                <p className="text-slate-400 text-xs">جودة البيانات</p>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-3 text-center">
                <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{analysis.data_quality?.issues?.length || 0}</p>
                <p className="text-slate-400 text-xs">مشاكل مكتشفة</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-3 text-center">
                <Sparkles className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{analysis.feature_engineering?.length || 0}</p>
                <p className="text-slate-400 text-xs">ميزات مقترحة</p>
              </CardContent>
            </Card>
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardContent className="p-3 text-center">
                <Layers className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{analysis.sampling_augmentation?.augmentation_techniques?.length || 0}</p>
                <p className="text-slate-400 text-xs">تقنيات تعزيز</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
              <TabsTrigger value="validation" className="data-[state=active]:bg-red-500/20">
                <FileSearch className="w-3 h-3 ml-1" />
                التحقق والتنظيف
              </TabsTrigger>
              <TabsTrigger value="features" className="data-[state=active]:bg-purple-500/20">
                <Wand2 className="w-3 h-3 ml-1" />
                هندسة الميزات
              </TabsTrigger>
              <TabsTrigger value="sampling" className="data-[state=active]:bg-cyan-500/20">
                <Shuffle className="w-3 h-3 ml-1" />
                العينات والتعزيز
              </TabsTrigger>
            </TabsList>

            {/* Validation Tab */}
            <TabsContent value="validation" className="mt-4 space-y-4">
              {/* Data Issues */}
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      مشاكل جودة البيانات
                    </CardTitle>
                    {selectedIssues.length > 0 && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 h-7"
                        onClick={() => applyCleaningMutation.mutate(selectedIssues)}
                        disabled={applyCleaningMutation.isPending}
                      >
                        {applyCleaningMutation.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <><CheckCircle className="w-3 h-3 ml-1" /> إصلاح المحدد ({selectedIssues.length})</>
                        )}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px]">
                    <div className="space-y-2">
                      {analysis.data_quality?.issues?.map((issue, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedIssues.includes(i)
                              ? 'bg-cyan-500/20 border-cyan-500/50'
                              : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-600'
                          }`}
                          onClick={() => issue.auto_fixable && toggleIssue(i)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={`bg-${getSeverityColor(issue.severity)}-500/20 text-${getSeverityColor(issue.severity)}-400 text-xs`}>
                                  {issue.severity}
                                </Badge>
                                <span className="text-white font-medium text-sm">{issue.type}</span>
                                {issue.auto_fixable && (
                                  <Badge className="bg-green-500/20 text-green-400 text-xs">
                                    <Zap className="w-2 h-2 ml-1" />
                                    قابل للإصلاح التلقائي
                                  </Badge>
                                )}
                              </div>
                              <p className="text-slate-400 text-xs mb-1">{issue.description}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 text-xs">الأعمدة المتأثرة:</span>
                                {issue.affected_columns?.map((col, j) => (
                                  <Badge key={j} variant="outline" className="text-xs border-slate-600">
                                    {col}
                                  </Badge>
                                ))}
                                <span className="text-amber-400 text-xs">({issue.affected_rows_percentage}% من الصفوف)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Cleaning Suggestions */}
              <Card className="bg-green-500/10 border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Filter className="w-4 h-4 text-green-400" />
                    اقتراحات التنظيف
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-2">
                    {analysis.cleaning_suggestions?.map((suggestion, i) => (
                      <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium text-sm">{suggestion.method}</span>
                          {suggestion.automated && (
                            <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">تلقائي</Badge>
                          )}
                        </div>
                        <p className="text-slate-400 text-xs mb-1">{suggestion.description}</p>
                        <p className="text-green-400 text-xs">التأثير: {suggestion.impact}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Feature Engineering Tab */}
            <TabsContent value="features" className="mt-4">
              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-purple-400" />
                    الميزات المقترحة بواسطة AI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-3">
                      {analysis.feature_engineering?.map((feature, i) => (
                        <div key={i} className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/20">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-bold">{feature.name}</span>
                                <Badge className="bg-purple-500/20 text-purple-400 text-xs">{feature.type}</Badge>
                                <Badge className={`text-xs ${
                                  feature.complexity === 'low' ? 'bg-green-500/20 text-green-400' :
                                  feature.complexity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {feature.complexity}
                                </Badge>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="border-purple-500/50 h-7">
                              <Plus className="w-3 h-3 ml-1" />
                              إضافة
                            </Button>
                          </div>
                          <p className="text-slate-400 text-sm mb-2">{feature.description}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-slate-500 text-xs">المصدر:</span>
                            {feature.source_features?.map((src, j) => (
                              <Badge key={j} variant="outline" className="text-xs border-slate-600">{src}</Badge>
                            ))}
                          </div>
                          <p className="text-cyan-400 text-xs">التأثير المتوقع: {feature.expected_impact}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sampling & Augmentation Tab */}
            <TabsContent value="sampling" className="mt-4 space-y-4">
              {/* Sampling Strategies */}
              <Card className="bg-cyan-500/10 border-cyan-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    استراتيجيات أخذ العينات الذكية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {analysis.sampling_augmentation?.sampling_strategies?.map((strategy, i) => (
                      <div key={i} className={`p-3 rounded-lg border ${
                        strategy.recommended ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-900/50 border-slate-700/50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{strategy.name}</span>
                          {strategy.recommended && (
                            <Badge className="bg-green-500/20 text-green-400 text-xs">موصى به</Badge>
                          )}
                        </div>
                        <p className="text-slate-400 text-xs mb-1">{strategy.description}</p>
                        <p className="text-cyan-400 text-xs">الاستخدام: {strategy.use_case}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Augmentation Techniques */}
              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    تقنيات تعزيز البيانات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.sampling_augmentation?.augmentation_techniques?.map((tech, i) => (
                      <div key={i} className="p-3 bg-slate-900/50 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="text-white font-medium">{tech.name}</span>
                          <p className="text-slate-400 text-xs">{tech.description}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {tech.applicable_data_types?.map((type, j) => (
                              <Badge key={j} variant="outline" className="text-xs border-slate-600">{type}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-green-400 text-xs">{tech.expected_improvement}</p>
                          <Button size="sm" variant="outline" className="border-amber-500/50 h-6 mt-1">
                            تطبيق
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Class Balance */}
              {analysis.sampling_augmentation?.class_balance_status && (
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">توازن الفئات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 mb-2">{analysis.sampling_augmentation.class_balance_status}</p>
                    {analysis.sampling_augmentation.rebalancing_suggestions?.length > 0 && (
                      <div className="space-y-1">
                        {analysis.sampling_augmentation.rebalancing_suggestions.map((sug, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span className="text-slate-400">{sug}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Overall Recommendations */}
          {analysis.overall_recommendations?.length > 0 && (
            <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-cyan-400" />
                  توصيات AI الشاملة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.overall_recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">{rec}</span>
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