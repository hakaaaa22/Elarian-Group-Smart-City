import React, { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Camera, Upload, Brain, RefreshCw, CheckCircle, AlertTriangle, Recycle,
  Trash2, Leaf, AlertOctagon, Image, BarChart3, TrendingUp, Target, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7'];

const contaminationData = [
  { category: 'قابل للتدوير', contamination: 18, target: 5 },
  { category: 'عضوي', contamination: 12, target: 8 },
  { category: 'عام', contamination: 8, target: 15 },
];

const classificationHistory = [
  { id: 1, timestamp: '10:45', binId: 'BIN-005', detected: 'بلاستيك PET', confidence: 94, contaminated: false, image: '📷' },
  { id: 2, timestamp: '10:32', binId: 'BIN-012', detected: 'نفايات عضوية', confidence: 87, contaminated: true, contaminant: 'بلاستيك', image: '📷' },
  { id: 3, timestamp: '10:15', binId: 'BIN-008', detected: 'كرتون', confidence: 92, contaminated: false, image: '📷' },
  { id: 4, timestamp: '10:05', binId: 'BIN-003', detected: 'زجاج', confidence: 89, contaminated: true, contaminant: 'معدن', image: '📷' },
  { id: 5, timestamp: '09:48', binId: 'BIN-015', detected: 'نفايات خطرة', confidence: 96, contaminated: false, image: '📷' },
];

const wasteCategories = [
  { name: 'بلاستيك', value: 35, color: '#3b82f6' },
  { name: 'ورق/كرتون', value: 25, color: '#22c55e' },
  { name: 'عضوي', value: 20, color: '#f59e0b' },
  { name: 'زجاج', value: 12, color: '#a855f7' },
  { name: 'أخرى', value: 8, color: '#64748b' },
];

export default function AIWasteRecognition() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [segregationScore, setSegregationScore] = useState(78);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const fileInputRef = useRef(null);

  const analyzeImage = useMutation({
    mutationFn: async (imageData) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في تصنيف النفايات باستخدام الذكاء الاصطناعي والتعرف على الصور، قم بتحليل الصورة وقدم تصنيفاً دقيقاً:

وصف الصورة: ${imageData.description || 'صورة نفايات مختلطة تحتوي على عناصر متعددة'}
مصدر الصورة: ${imageData.source || 'رفع مستخدم'}

قم بتحليل شامل يتضمن:
1. نوع النفايات الرئيسي والفرعي
2. نسبة الثقة في التصنيف لكل عنصر
3. اكتشاف التلوث (مواد غير مناسبة في الحاوية)
4. تقييم جودة الفرز
5. توصيات للفرز الصحيح
6. قابلية إعادة التدوير
7. التأثير البيئي
8. الحاوية الصحيحة لكل عنصر`,
        response_json_schema: {
          type: "object",
          properties: {
            primaryCategory: { type: "string" },
            confidence: { type: "number" },
            detectedItems: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  item: { type: "string" },
                  percentage: { type: "number" },
                  recyclable: { type: "boolean" }
                }
              }
            },
            contamination: {
              type: "object",
              properties: {
                detected: { type: "boolean" },
                contaminants: { type: "array", items: { type: "string" } },
                severity: { type: "string" }
              }
            },
            recyclingPotential: { type: "number" },
            properBin: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } },
            environmentalImpact: { type: "string" },
            segregationQuality: { type: "number" },
            detailedClassification: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  itemName: { type: "string" },
                  category: { type: "string" },
                  subCategory: { type: "string" },
                  confidence: { type: "number" },
                  correctBin: { type: "string" },
                  isInCorrectBin: { type: "boolean" }
                }
              }
            }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setIsAnalyzing(false);
      if (data.segregationQuality) setSegregationScore(data.segregationQuality);
      toast.success('تم تحليل الصورة بنجاح');
    },
    onError: () => {
      setIsAnalyzing(false);
      toast.error('حدث خطأ في التحليل');
    }
  });

  const analyzeContamination = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في تحليل جودة فرز النفايات وتحسين دقة الفصل، حلل بيانات التلوث التالية:

بيانات التلوث الحالية:
${contaminationData.map(c => `${c.category}: تلوث ${c.contamination}% (الهدف: ${c.target}%)`).join('\n')}

سجل التصنيفات الأخيرة من مستشعرات الحاويات:
${classificationHistory.map(h => `${h.detected}: ثقة ${h.confidence}%${h.contaminated ? ' - ملوث بـ ' + h.contaminant : ''}`).join('\n')}

جودة الفرز الحالية: ${segregationScore}%

قدم تحليلاً شاملاً يتضمن:
1. تقييم جودة الفرز الحالية مع درجة من 100
2. مصادر التلوث الرئيسية في كل فئة
3. توصيات محددة لتحسين دقة الفرز
4. التأثير البيئي والاقتصادي للتلوث
5. خطة عمل لتحسين الفصل
6. مؤشرات الأداء المقترحة`,
        response_json_schema: {
          type: "object",
          properties: {
            overallQuality: { type: "number" },
            qualityGrade: { type: "string" },
            mainContaminationSources: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "object", properties: { area: { type: "string" }, suggestion: { type: "string" }, expectedImprovement: { type: "number" } } } },
            economicImpact: { type: "object", properties: { currentLoss: { type: "number" }, potentialSavings: { type: "number" } } },
            recommendations: { type: "array", items: { type: "string" } },
            actionPlan: { type: "array", items: { type: "object", properties: { action: { type: "string" }, priority: { type: "string" }, expectedImprovement: { type: "number" } } } },
            kpis: { type: "array", items: { type: "object", properties: { metric: { type: "string" }, current: { type: "number" }, target: { type: "number" } } } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAnalysisResult(prev => ({ ...prev, contamination: data }));
      if (data.recommendations) setAiSuggestions(data.recommendations);
      toast.success('تم تحليل التلوث');
    }
  });

  // Simulate bin sensor image analysis
  const analyzeBinSensorImage = useMutation({
    mutationFn: async (binId) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل صورة من مستشعر الحاوية ${binId}:
        
محاكاة: الحاوية تحتوي على خليط من النفايات يظهر فيها:
- زجاجات بلاستيكية
- علب معدنية
- بعض بقايا الطعام (تلوث محتمل)
- ورق وكرتون

قدم تصنيفاً مفصلاً مع نسبة الثقة لكل عنصر`,
        response_json_schema: {
          type: "object",
          properties: {
            binId: { type: "string" },
            detectedItems: { type: "array", items: { type: "object", properties: { item: { type: "string" }, confidence: { type: "number" }, category: { type: "string" } } } },
            contamination: { type: "object", properties: { detected: { type: "boolean" }, items: { type: "array", items: { type: "string" } }, severity: { type: "string" } } },
            overallClassification: { type: "string" },
            actionRequired: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      toast.success(`تم تحليل صورة الحاوية ${data.binId || 'BIN-XXX'}`);
    }
  });

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
        setIsAnalyzing(true);
        analyzeImage.mutate({ description: 'صورة نفايات تم رفعها للتحليل' });
      };
      reader.readAsDataURL(file);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'بلاستيك': Recycle,
      'ورق/كرتون': Recycle,
      'عضوي': Leaf,
      'زجاج': Recycle,
      'خطرة': AlertOctagon,
    };
    return icons[category] || Trash2;
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-cyan-400" />
          التعرف الذكي على النفايات
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-cyan-500/50 text-cyan-400" onClick={() => analyzeBinSensorImage.mutate('BIN-005')} disabled={analyzeBinSensorImage.isPending}>
            {analyzeBinSensorImage.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Camera className="w-4 h-4 ml-2" />}
            تحليل مستشعر
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => analyzeContamination.mutate()} disabled={analyzeContamination.isPending}>
            {analyzeContamination.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <BarChart3 className="w-4 h-4 ml-2" />}
            تحليل التلوث
          </Button>
        </div>
      </div>

      {/* Segregation Score */}
      <Card className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border-green-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${segregationScore >= 80 ? 'bg-green-500/20' : segregationScore >= 60 ? 'bg-amber-500/20' : 'bg-red-500/20'}`}>
                <span className={`text-2xl font-bold ${segregationScore >= 80 ? 'text-green-400' : segregationScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                  {segregationScore}%
                </span>
              </div>
              <div>
                <p className="text-white font-bold">دقة الفرز الإجمالية</p>
                <p className="text-slate-400 text-sm">الهدف: 90% | التحسن المطلوب: {90 - segregationScore}%</p>
              </div>
            </div>
            {aiSuggestions.length > 0 && (
              <div className="text-left">
                <Badge className="bg-purple-500/20 text-purple-400">{aiSuggestions.length} توصيات AI</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Image Upload & Analysis */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              تحليل صورة النفايات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            
            {!uploadedImage ? (
              <div 
                className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-500/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-white font-medium mb-1">اسحب الصورة هنا أو اضغط للرفع</p>
                <p className="text-slate-500 text-sm">PNG, JPG حتى 10MB</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img src={uploadedImage} alt="Uploaded" className="w-full h-48 object-cover rounded-lg" />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Brain className="w-10 h-10 text-purple-400 mx-auto mb-2 animate-pulse" />
                        <p className="text-white">جاري التحليل...</p>
                      </div>
                    </div>
                  )}
                </div>
                <Button variant="outline" className="w-full border-slate-600" onClick={() => { setUploadedImage(null); setAnalysisResult(null); }}>
                  رفع صورة جديدة
                </Button>
              </div>
            )}

            {/* Analysis Result */}
            {analysisResult && !analysisResult.contamination && (
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-bold">{analysisResult.primaryCategory}</p>
                    <Badge className="bg-green-500/20 text-green-400">{analysisResult.confidence}% ثقة</Badge>
                  </div>
                  <p className="text-slate-400 text-sm">الحاوية المناسبة: {analysisResult.properBin}</p>
                </div>

                {/* Detected Items */}
                {analysisResult.detectedItems?.length > 0 && (
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-slate-400 text-xs mb-2">العناصر المكتشفة</p>
                    <div className="space-y-2">
                      {analysisResult.detectedItems.map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-white text-sm">{item.item}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={item.percentage} className="w-20 h-2" />
                            <span className="text-slate-400 text-xs">{item.percentage}%</span>
                            {item.recyclable && <Recycle className="w-3 h-3 text-green-400" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contamination */}
                {analysisResult.contamination?.detected && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <p className="text-red-400 font-medium">تم اكتشاف تلوث</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.contamination.contaminants?.map((c, i) => (
                        <Badge key={i} className="bg-red-500/20 text-red-400">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recycling Potential */}
                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <Recycle className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-green-400 font-bold">{analysisResult.recyclingPotential}%</p>
                    <p className="text-slate-400 text-xs">قابلية إعادة التدوير</p>
                  </div>
                </div>

                {/* Detailed Classification */}
                {analysisResult.detailedClassification?.length > 0 && (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <p className="text-purple-400 text-xs font-medium mb-2">التصنيف المفصل</p>
                    <div className="space-y-2">
                      {analysisResult.detailedClassification.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {item.isInCorrectBin ? <CheckCircle className="w-3 h-3 text-green-400" /> : <AlertTriangle className="w-3 h-3 text-red-400" />}
                            <span className="text-white">{item.itemName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-slate-700 text-xs">{item.category}</Badge>
                            <span className="text-cyan-400">{item.confidence}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {analysisResult.recommendations?.length > 0 && (
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <p className="text-cyan-400 text-xs font-medium mb-2">توصيات الفرز</p>
                    <ul className="space-y-1">
                      {analysisResult.recommendations.slice(0, 3).map((rec, i) => (
                        <li key={i} className="text-white text-xs flex items-start gap-2">
                          <Target className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contamination Analytics */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              تحليلات التلوث
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contaminationData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="contamination" fill="#ef4444" name="التلوث الحالي %" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="target" fill="#22c55e" name="الهدف %" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Contamination Analysis Result */}
            {analysisResult?.contamination && (
              <div className="space-y-3">
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">جودة الفرز</p>
                    <Badge className={analysisResult.contamination.overallQuality >= 80 ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}>
                      {analysisResult.contamination.qualityGrade || 'جيد'}
                    </Badge>
                  </div>
                  <Progress value={analysisResult.contamination.overallQuality || 75} className="h-3" />
                </div>

                {analysisResult.contamination.improvements?.length > 0 && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 font-medium mb-2">فرص التحسين</p>
                    <ul className="space-y-1">
                      {analysisResult.contamination.improvements.slice(0, 3).map((imp, i) => (
                        <li key={i} className="text-white text-sm flex items-center gap-2">
                          <Target className="w-3 h-3 text-green-400" />
                          {imp.suggestion} (+{imp.expectedImprovement}%)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Plan */}
                {analysisResult.contamination.actionPlan?.length > 0 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-amber-400 font-medium mb-2">خطة العمل</p>
                    <div className="space-y-2">
                      {analysisResult.contamination.actionPlan.slice(0, 4).map((action, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded p-2">
                          <span className="text-white text-sm">{action.action}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={action.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-slate-600 text-slate-300'}>
                              {action.priority === 'high' ? 'عالي' : 'متوسط'}
                            </Badge>
                            <span className="text-green-400 text-xs">+{action.expectedImprovement}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* KPIs */}
                {analysisResult.contamination.kpis?.length > 0 && (
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <p className="text-cyan-400 font-medium mb-2">مؤشرات الأداء</p>
                    <div className="grid grid-cols-2 gap-2">
                      {analysisResult.contamination.kpis.slice(0, 4).map((kpi, i) => (
                        <div key={i} className="bg-slate-800/50 rounded p-2">
                          <p className="text-slate-400 text-xs">{kpi.metric}</p>
                          <div className="flex items-center gap-1">
                            <span className="text-white font-bold">{kpi.current}%</span>
                            <span className="text-slate-500">/</span>
                            <span className="text-green-400">{kpi.target}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Waste Distribution */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">توزيع أنواع النفايات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wasteCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {wasteCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Classifications */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">آخر التصنيفات</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {classificationHistory.map(item => (
                  <div key={item.id} className={`p-2 rounded-lg ${item.contaminated ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-800/50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.image}</span>
                        <div>
                          <p className="text-white text-sm">{item.detected}</p>
                          <p className="text-slate-500 text-xs">{item.binId} • {item.timestamp}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-cyan-500/20 text-cyan-400">{item.confidence}%</Badge>
                        {item.contaminated ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                    </div>
                    {item.contaminated && (
                      <p className="text-amber-400 text-xs mt-1">تلوث: {item.contaminant}</p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}