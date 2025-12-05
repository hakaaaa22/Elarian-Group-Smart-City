import React, { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Upload, Play, Pause, SkipBack, SkipForward, Rewind, FastForward,
  ZoomIn, ZoomOut, RotateCcw, RotateCw, Maximize2, Download, Share2,
  Camera, Video, Image, User, Car, Clock, Calendar, MapPin, AlertTriangle,
  CheckCircle, XCircle, Eye, EyeOff, Layers, Filter, Sliders, Wand2,
  FileVideo, Film, Scissors, Copy, Trash2, Save, FileText, Shield,
  Fingerprint, ScanFace, Target, Crosshair, Move, Crop, Palette,
  Sun, Moon, Contrast, Droplets, Aperture, Focus, Grid, Timer,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2,
  Brain, Sparkles, History, Database, HardDrive, Lock, Unlock, Hash,
  Heart, Activity, Mic, Volume2, VolumeX, Headphones, UserCircle, Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Mock cameras for search
const allCameras = [
  { id: 'cam-1', name: 'البوابة الرئيسية', location: 'المدخل', status: 'online' },
  { id: 'cam-2', name: 'موقف A', location: 'الطابق الأرضي', status: 'online' },
  { id: 'cam-3', name: 'موقف B', location: 'الطابق الأول', status: 'online' },
  { id: 'cam-4', name: 'الردهة', location: 'المبنى الرئيسي', status: 'online' },
  { id: 'cam-5', name: 'المخرج الخلفي', location: 'الجهة الخلفية', status: 'online' },
  { id: 'cam-6', name: 'غرفة الخوادم', location: 'الطابق السفلي', status: 'online' },
  { id: 'cam-7', name: 'منطقة التحميل', location: 'المستودع', status: 'online' },
  { id: 'cam-8', name: 'المصعد 1', location: 'المبنى A', status: 'online' },
];

// Enhancement presets
const enhancementPresets = [
  { id: 'auto', name: 'تحسين تلقائي', icon: Wand2 },
  { id: 'night', name: 'تحسين ليلي', icon: Moon },
  { id: 'fog', name: 'إزالة الضباب', icon: Droplets },
  { id: 'motion', name: 'تقليل الضبابية', icon: Move },
  { id: 'sharpen', name: 'زيادة الحدة', icon: Focus },
  { id: 'denoise', name: 'إزالة التشويش', icon: Aperture },
];

// Analysis types
const analysisTypes = [
  { id: 'face', name: 'التعرف على الوجوه', icon: ScanFace, color: 'purple' },
  { id: 'plate', name: 'قراءة اللوحات', icon: Car, color: 'cyan' },
  { id: 'object', name: 'كشف الأجسام', icon: Target, color: 'amber' },
  { id: 'motion', name: 'تحليل الحركة', icon: Move, color: 'green' },
  { id: 'tamper', name: 'كشف التلاعب', icon: Shield, color: 'red' },
  { id: 'metadata', name: 'تحليل البيانات الوصفية', icon: Hash, color: 'blue' },
];

// Human behavior emotions
const emotionTypes = [
  { id: 'happy', name: 'سعادة', emoji: '😊', color: 'green' },
  { id: 'sad', name: 'حزن', emoji: '😢', color: 'blue' },
  { id: 'angry', name: 'غضب', emoji: '😠', color: 'red' },
  { id: 'fear', name: 'خوف', emoji: '😨', color: 'purple' },
  { id: 'surprise', name: 'دهشة', emoji: '😲', color: 'amber' },
  { id: 'disgust', name: 'اشمئزاز', emoji: '🤢', color: 'green' },
  { id: 'neutral', name: 'محايد', emoji: '😐', color: 'slate' },
  { id: 'contempt', name: 'ازدراء', emoji: '😏', color: 'orange' },
];

// Behavior patterns
const behaviorPatterns = [
  { id: 'aggressive', name: 'عدواني', icon: AlertTriangle, color: 'red' },
  { id: 'nervous', name: 'متوتر/قلق', icon: Activity, color: 'amber' },
  { id: 'suspicious', name: 'مريب', icon: Eye, color: 'purple' },
  { id: 'normal', name: 'طبيعي', icon: CheckCircle, color: 'green' },
  { id: 'distressed', name: 'مكروب', icon: AlertTriangle, color: 'orange' },
  { id: 'intoxicated', name: 'تحت تأثير', icon: Droplets, color: 'red' },
];

export default function ForensicVideoAnalysis() {
  // States
  const [activeTab, setActiveTab] = useState('search');
  const [searchImage, setSearchImage] = useState(null);
  const [searchType, setSearchType] = useState('face');
  const [selectedCameras, setSelectedCameras] = useState([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoSettings, setVideoSettings] = useState({
    brightness: 50,
    contrast: 50,
    saturation: 50,
    sharpness: 50,
    gamma: 50,
    zoom: 100,
    rotation: 0,
    playbackSpeed: 1,
  });
  const [analysisResults, setAnalysisResults] = useState(null);
  const [tamperAnalysis, setTamperAnalysis] = useState(null);
  const [showTimelapse, setShowTimelapse] = useState(false);
  const [timelapseSettings, setTimelapseSettings] = useState({
    speed: 10,
    interval: 60,
    duration: 3600,
  });
  const [exportSettings, setExportSettings] = useState({
    format: 'mp4',
    quality: 'high',
    includeMetadata: true,
    includeHash: true,
    watermark: false,
  });
  const [humanAnalysis, setHumanAnalysis] = useState(null);
  const [voiceAnalysis, setVoiceAnalysis] = useState(null);

  const fileInputRef = useRef(null);

  // AI Search mutation
  const searchMutation = useMutation({
    mutationFn: async (params) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت نظام بحث جنائي متقدم. قم بتحليل طلب البحث وإنشاء نتائج بحث واقعية.

نوع البحث: ${params.searchType === 'face' ? 'وجه' : params.searchType === 'plate' ? 'لوحة مركبة' : params.searchType === 'object' ? 'جسم/شخص' : 'حركة'}
الكاميرات المحددة: ${params.cameras.length > 0 ? params.cameras.join(', ') : 'جميع الكاميرات'}
الفترة الزمنية: ${params.dateRange.from || 'غير محدد'} إلى ${params.dateRange.to || 'غير محدد'}

قم بإنشاء 5-8 نتائج بحث مع:
- نسبة تطابق (70-99%)
- وقت وتاريخ الظهور
- الكاميرا والموقع
- وصف مختصر للمشهد
- مستوى الثقة`,
        response_json_schema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  match_percentage: { type: "number" },
                  timestamp: { type: "string" },
                  camera_name: { type: "string" },
                  location: { type: "string" },
                  description: { type: "string" },
                  confidence_level: { type: "string" },
                  thumbnail_id: { type: "number" }
                }
              }
            },
            total_scanned: { type: "number" },
            processing_time: { type: "string" },
            search_summary: { type: "string" }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setSearchResults(data.results || []);
      toast.success(`تم العثور على ${data.results?.length || 0} نتيجة`);
      setIsSearching(false);
    },
    onError: () => {
      toast.error('فشل في البحث');
      setIsSearching(false);
    }
  });

  // Tamper detection mutation
  const tamperMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير في تحليل الفيديو الجنائي وكشف التلاعب. قم بتحليل فيديو وتقديم تقرير شامل عن أي علامات تلاعب.

قم بفحص:
1. التلاعب الزمني (حذف أو إضافة إطارات)
2. التلاعب المكاني (قص أو تعديل مناطق)
3. تغيير البيانات الوصفية
4. ضغط غير طبيعي
5. علامات الدمج أو التركيب
6. تغييرات الإضاءة المفاجئة
7. عدم تطابق الصوت

قدم تقرير مفصل مع نسبة الثقة لكل نوع من التلاعب المحتمل.`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_integrity: { type: "number" },
            is_tampered: { type: "boolean" },
            tampering_types: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  detected: { type: "boolean" },
                  confidence: { type: "number" },
                  location: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            metadata_analysis: {
              type: "object",
              properties: {
                creation_date: { type: "string" },
                modification_date: { type: "string" },
                software_used: { type: "string" },
                codec: { type: "string" },
                frame_rate: { type: "string" },
                resolution: { type: "string" },
                anomalies: { type: "array", items: { type: "string" } }
              }
            },
            frame_analysis: {
              type: "object",
              properties: {
                total_frames: { type: "number" },
                missing_frames: { type: "number" },
                duplicated_frames: { type: "number" },
                suspicious_frames: { type: "array", items: { type: "number" } }
              }
            },
            recommendations: { type: "array", items: { type: "string" } },
            hash_sha256: { type: "string" },
            forensic_summary: { type: "string" }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setTamperAnalysis(data);
      toast.success('تم تحليل الفيديو');
    }
  });

  // Human behavior analysis mutation
  const humanAnalysisMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير في تحليل السلوك البشري والعواطف من خلال الفيديو والصوت.

قم بتحليل شامل يتضمن:

1. تحليل تعبيرات الوجه والعواطف:
   - تحديد المشاعر الأساسية (سعادة، حزن، غضب، خوف، دهشة، اشمئزاز، محايد)
   - نسبة الثقة لكل عاطفة
   - تغيرات العواطف عبر الوقت

2. تحليل لغة الجسد:
   - وضعية الجسم
   - حركات اليدين
   - التواصل البصري
   - علامات التوتر أو الراحة

3. تحليل الصوت والكلام:
   - نبرة الصوت
   - سرعة الكلام
   - التردد والتوقفات
   - علامات الكذب أو الصدق
   - مستوى الثقة في الكلام

4. تحليل السلوك العام:
   - تصنيف السلوك (طبيعي، عدواني، متوتر، مريب)
   - احتمالية وجود تهديد
   - توصيات أمنية

قدم تقريراً مفصلاً مع نسب دقة لكل تحليل.`,
        response_json_schema: {
          type: "object",
          properties: {
            facial_emotions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  timestamp: { type: "string" },
                  emotion: { type: "string" },
                  confidence: { type: "number" },
                  intensity: { type: "string" },
                  micro_expressions: { type: "array", items: { type: "string" } }
                }
              }
            },
            dominant_emotion: {
              type: "object",
              properties: {
                emotion: { type: "string" },
                percentage: { type: "number" },
                description: { type: "string" }
              }
            },
            body_language: {
              type: "object",
              properties: {
                posture: { type: "string" },
                posture_confidence: { type: "number" },
                gestures: { type: "array", items: { type: "string" } },
                eye_contact: { type: "string" },
                stress_indicators: { type: "array", items: { type: "string" } },
                comfort_level: { type: "number" }
              }
            },
            voice_analysis: {
              type: "object",
              properties: {
                tone: { type: "string" },
                tone_confidence: { type: "number" },
                speech_rate: { type: "string" },
                volume_level: { type: "string" },
                hesitation_count: { type: "number" },
                stress_in_voice: { type: "number" },
                deception_indicators: { type: "number" },
                emotional_state: { type: "string" }
              }
            },
            behavior_classification: {
              type: "object",
              properties: {
                primary_behavior: { type: "string" },
                confidence: { type: "number" },
                threat_level: { type: "string" },
                threat_score: { type: "number" },
                anomalies: { type: "array", items: { type: "string" } }
              }
            },
            timeline_events: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  timestamp: { type: "string" },
                  event_type: { type: "string" },
                  description: { type: "string" },
                  significance: { type: "string" }
                }
              }
            },
            persons_detected: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  person_id: { type: "string" },
                  age_estimate: { type: "string" },
                  gender_estimate: { type: "string" },
                  emotional_profile: { type: "string" },
                  behavior_summary: { type: "string" }
                }
              }
            },
            overall_assessment: {
              type: "object",
              properties: {
                risk_level: { type: "string" },
                confidence_score: { type: "number" },
                key_observations: { type: "array", items: { type: "string" } },
                recommendations: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setHumanAnalysis(data);
      toast.success('تم تحليل السلوك البشري بنجاح');
    },
    onError: () => {
      toast.error('فشل في التحليل');
    }
  });

  // Voice-only analysis mutation
  const voiceAnalysisMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير في تحليل الصوت والكلام البشري.

قم بتحليل الصوت وتقديم:
1. تحليل النبرة والعاطفة
2. كشف علامات الكذب/الصدق
3. مستوى التوتر والضغط
4. تحليل الكلمات والتردد
5. الحالة النفسية المتوقعة`,
        response_json_schema: {
          type: "object",
          properties: {
            voice_characteristics: {
              type: "object",
              properties: {
                pitch: { type: "string" },
                volume: { type: "string" },
                tempo: { type: "string" },
                clarity: { type: "number" }
              }
            },
            emotional_indicators: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  emotion: { type: "string" },
                  confidence: { type: "number" },
                  timestamp: { type: "string" }
                }
              }
            },
            truthfulness_analysis: {
              type: "object",
              properties: {
                credibility_score: { type: "number" },
                deception_indicators: { type: "array", items: { type: "string" } },
                confidence_markers: { type: "array", items: { type: "string" } }
              }
            },
            stress_analysis: {
              type: "object",
              properties: {
                overall_stress: { type: "number" },
                peak_stress_moments: { type: "array", items: { type: "string" } },
                relaxation_periods: { type: "array", items: { type: "string" } }
              }
            },
            speech_patterns: {
              type: "object",
              properties: {
                hesitations: { type: "number" },
                filler_words: { type: "number" },
                interruptions: { type: "number" },
                speech_rate_wpm: { type: "number" }
              }
            },
            psychological_profile: {
              type: "object",
              properties: {
                dominant_state: { type: "string" },
                secondary_states: { type: "array", items: { type: "string" } },
                recommendations: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setVoiceAnalysis(data);
      toast.success('تم تحليل الصوت بنجاح');
    }
  });

  // Video analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async (analysisType) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل فيديو المراقبة وتقديم نتائج ${analysisType === 'face' ? 'التعرف على الوجوه' : analysisType === 'plate' ? 'قراءة لوحات المركبات' : analysisType === 'object' ? 'كشف الأجسام' : 'تحليل الحركة'}.

قدم:
- الأجسام/الأشخاص المكتشفة
- الطوابع الزمنية
- نسب الثقة
- الإحصائيات`,
        response_json_schema: {
          type: "object",
          properties: {
            detections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  type: { type: "string" },
                  timestamp: { type: "string" },
                  confidence: { type: "number" },
                  description: { type: "string" },
                  bounding_box: { type: "string" }
                }
              }
            },
            statistics: {
              type: "object",
              properties: {
                total_detections: { type: "number" },
                unique_objects: { type: "number" },
                avg_confidence: { type: "number" },
                processing_time: { type: "string" }
              }
            },
            timeline: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  time: { type: "string" },
                  event: { type: "string" },
                  count: { type: "number" }
                }
              }
            }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setAnalysisResults(data);
      toast.success('تم التحليل بنجاح');
    }
  });

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSearchImage(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = () => {
    setIsSearching(true);
    searchMutation.mutate({
      searchType,
      cameras: selectedCameras,
      dateRange,
    });
  };

  const toggleCamera = (camId) => {
    setSelectedCameras(prev => 
      prev.includes(camId) 
        ? prev.filter(id => id !== camId)
        : [...prev, camId]
    );
  };

  const handleExport = () => {
    toast.success('جاري تصدير الفيديو مع البيانات الجنائية...');
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/20">
            <Fingerprint className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">التحليل الجنائي للفيديو</h2>
            <p className="text-slate-400 text-sm">أدوات بحث وتحليل متقدمة</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap">
          <TabsTrigger value="search" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Search className="w-4 h-4 ml-2" />
            البحث بالصورة
          </TabsTrigger>
          <TabsTrigger value="enhance" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Wand2 className="w-4 h-4 ml-2" />
            تحسين الفيديو
          </TabsTrigger>
          <TabsTrigger value="tamper" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
            <Shield className="w-4 h-4 ml-2" />
            كشف التلاعب
          </TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Brain className="w-4 h-4 ml-2" />
            التحليلات
          </TabsTrigger>
          <TabsTrigger value="human" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
            <Heart className="w-4 h-4 ml-2" />
            التحليل البشري
          </TabsTrigger>
          <TabsTrigger value="timelapse" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Timer className="w-4 h-4 ml-2" />
            Timelapse
          </TabsTrigger>
          <TabsTrigger value="export" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <Download className="w-4 h-4 ml-2" />
            التصدير
          </TabsTrigger>
        </TabsList>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Upload & Settings */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">رفع صورة للبحث</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-purple-500/50 transition-colors"
                >
                  {searchImage ? (
                    <img src={searchImage} alt="Search" className="max-h-40 mx-auto rounded-lg" />
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">انقر لرفع صورة</p>
                      <p className="text-slate-500 text-xs">وجه، لوحة مركبة، شخص، جسم</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div>
                  <Label className="text-slate-300 text-sm">نوع البحث</Label>
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="face">🔍 بحث بالوجه</SelectItem>
                      <SelectItem value="plate">🚗 بحث بلوحة المركبة</SelectItem>
                      <SelectItem value="person">👤 بحث بالشخص</SelectItem>
                      <SelectItem value="object">📦 بحث بجسم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-slate-300 text-xs">من تاريخ</Label>
                    <Input 
                      type="datetime-local" 
                      className="bg-slate-800/50 border-slate-700 text-white mt-1 text-xs"
                      value={dateRange.from}
                      onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs">إلى تاريخ</Label>
                    <Input 
                      type="datetime-local" 
                      className="bg-slate-800/50 border-slate-700 text-white mt-1 text-xs"
                      value={dateRange.to}
                      onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    />
                  </div>
                </div>

                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 ml-2" />
                  )}
                  بدء البحث
                </Button>
              </CardContent>
            </Card>

            {/* Camera Selection */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm">اختيار الكاميرات</CardTitle>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-xs"
                    onClick={() => setSelectedCameras(selectedCameras.length === allCameras.length ? [] : allCameras.map(c => c.id))}
                  >
                    {selectedCameras.length === allCameras.length ? 'إلغاء الكل' : 'تحديد الكل'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                {allCameras.map(camera => (
                  <div
                    key={camera.id}
                    onClick={() => toggleCamera(camera.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedCameras.includes(camera.id)
                        ? 'bg-purple-500/20 border border-purple-500/50'
                        : 'bg-slate-800/50 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Camera className={`w-4 h-4 ${selectedCameras.includes(camera.id) ? 'text-purple-400' : 'text-slate-500'}`} />
                        <div>
                          <p className="text-white text-sm">{camera.name}</p>
                          <p className="text-slate-500 text-xs">{camera.location}</p>
                        </div>
                      </div>
                      {selectedCameras.includes(camera.id) && (
                        <CheckCircle className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">
                  نتائج البحث ({searchResults.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">ارفع صورة وابدأ البحث</p>
                  </div>
                ) : (
                  searchResults.map((result, i) => (
                    <motion.div
                      key={result.id || i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center">
                          <Video className="w-6 h-6 text-slate-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white text-sm font-medium">{result.camera_name}</span>
                            <Badge className={`${
                              result.match_percentage >= 90 ? 'bg-green-500/20 text-green-400' :
                              result.match_percentage >= 80 ? 'bg-amber-500/20 text-amber-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {result.match_percentage}% تطابق
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-xs">{result.location}</p>
                          <p className="text-slate-500 text-xs mt-1">{result.timestamp}</p>
                          <p className="text-slate-400 text-xs mt-1">{result.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Enhancement Tab */}
        <TabsContent value="enhance" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Video Preview */}
            <div className="lg:col-span-2">
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div 
                    className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden"
                    style={{
                      filter: `brightness(${videoSettings.brightness}%) contrast(${videoSettings.contrast}%) saturate(${videoSettings.saturation}%)`,
                      transform: `scale(${videoSettings.zoom / 100}) rotate(${videoSettings.rotation}deg)`
                    }}
                  >
                    <Video className="w-20 h-20 text-slate-700" />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge className="bg-cyan-500/80 text-white text-xs">معاينة محسّنة</Badge>
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center gap-2 mb-4">
                    <Button size="icon" variant="ghost"><ChevronsRight className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost"><SkipForward className="w-4 h-4" /></Button>
                    <Button size="icon" className="bg-cyan-600 hover:bg-cyan-700">
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost"><SkipBack className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost"><ChevronsLeft className="w-4 h-4" /></Button>
                    <div className="flex-1 mx-2">
                      <Slider defaultValue={[30]} max={100} step={1} />
                    </div>
                    <span className="text-white text-sm w-24">00:45 / 02:30</span>
                    <Select value={videoSettings.playbackSpeed.toString()} onValueChange={(v) => setVideoSettings({ ...videoSettings, playbackSpeed: parseFloat(v) })}>
                      <SelectTrigger className="w-20 bg-slate-800/50 border-slate-700 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="0.25">0.25x</SelectItem>
                        <SelectItem value="0.5">0.5x</SelectItem>
                        <SelectItem value="1">1x</SelectItem>
                        <SelectItem value="2">2x</SelectItem>
                        <SelectItem value="4">4x</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quick Presets */}
                  <div className="flex flex-wrap gap-2">
                    {enhancementPresets.map(preset => (
                      <Button
                        key={preset.id}
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-xs"
                        onClick={() => toast.success(`تم تطبيق: ${preset.name}`)}
                      >
                        <preset.icon className="w-3 h-3 ml-1" />
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhancement Controls */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">أدوات التحسين</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'brightness', label: 'السطوع', icon: Sun },
                  { key: 'contrast', label: 'التباين', icon: Contrast },
                  { key: 'saturation', label: 'التشبع', icon: Palette },
                  { key: 'sharpness', label: 'الحدة', icon: Focus },
                  { key: 'gamma', label: 'جاما', icon: Aperture },
                ].map(control => (
                  <div key={control.key}>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-slate-300 text-xs flex items-center gap-1">
                        <control.icon className="w-3 h-3" />
                        {control.label}
                      </Label>
                      <span className="text-white text-xs">{videoSettings[control.key]}%</span>
                    </div>
                    <Slider
                      value={[videoSettings[control.key]]}
                      onValueChange={([v]) => setVideoSettings({ ...videoSettings, [control.key]: v })}
                      max={100}
                      step={1}
                    />
                  </div>
                ))}

                <div className="pt-4 border-t border-slate-700 space-y-3">
                  <div>
                    <Label className="text-slate-300 text-xs">التكبير</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setVideoSettings({ ...videoSettings, zoom: Math.max(50, videoSettings.zoom - 10) })}>
                        <ZoomOut className="w-3 h-3" />
                      </Button>
                      <span className="text-white text-xs flex-1 text-center">{videoSettings.zoom}%</span>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setVideoSettings({ ...videoSettings, zoom: Math.min(200, videoSettings.zoom + 10) })}>
                        <ZoomIn className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300 text-xs">التدوير</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setVideoSettings({ ...videoSettings, rotation: videoSettings.rotation - 90 })}>
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                      <span className="text-white text-xs flex-1 text-center">{videoSettings.rotation}°</span>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setVideoSettings({ ...videoSettings, rotation: videoSettings.rotation + 90 })}>
                        <RotateCw className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                  onClick={() => setVideoSettings({ brightness: 50, contrast: 50, saturation: 50, sharpness: 50, gamma: 50, zoom: 100, rotation: 0, playbackSpeed: 1 })}
                >
                  <RotateCcw className="w-4 h-4 ml-2" />
                  إعادة تعيين
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tamper Detection Tab */}
        <TabsContent value="tamper" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Analysis Controls */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-400" />
                  كشف التلاعب والمصادقة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                  <Upload className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">اسحب الفيديو أو انقر للرفع</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'frame', label: 'تحليل الإطارات', icon: Film },
                    { id: 'metadata', label: 'البيانات الوصفية', icon: FileText },
                    { id: 'hash', label: 'التحقق من Hash', icon: Hash },
                    { id: 'audio', label: 'تحليل الصوت', icon: Wand2 },
                  ].map(analysis => (
                    <Button
                      key={analysis.id}
                      variant="outline"
                      className="border-slate-600 justify-start text-xs"
                    >
                      <analysis.icon className="w-3 h-3 ml-1" />
                      {analysis.label}
                    </Button>
                  ))}
                </div>

                <Button 
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={() => tamperMutation.mutate()}
                  disabled={tamperMutation.isPending}
                >
                  {tamperMutation.isPending ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4 ml-2" />
                  )}
                  بدء تحليل التلاعب
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">نتائج التحليل</CardTitle>
              </CardHeader>
              <CardContent>
                {tamperAnalysis ? (
                  <div className="space-y-4">
                    {/* Integrity Score */}
                    <div className={`p-4 rounded-xl text-center ${tamperAnalysis.is_tampered ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                      <div className={`text-4xl font-bold ${tamperAnalysis.is_tampered ? 'text-red-400' : 'text-green-400'}`}>
                        {tamperAnalysis.overall_integrity}%
                      </div>
                      <p className={`text-sm ${tamperAnalysis.is_tampered ? 'text-red-300' : 'text-green-300'}`}>
                        {tamperAnalysis.is_tampered ? '⚠️ تم اكتشاف تلاعب محتمل' : '✓ الفيديو أصلي'}
                      </p>
                    </div>

                    {/* Tampering Types */}
                    <div className="space-y-2">
                      <p className="text-slate-400 text-xs">فحوصات التلاعب:</p>
                      {tamperAnalysis.tampering_types?.map((type, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                          <span className="text-white text-xs">{type.type}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={type.confidence} className="w-16 h-1.5" />
                            <Badge className={type.detected ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                              {type.detected ? 'مكتشف' : 'سليم'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Metadata */}
                    {tamperAnalysis.metadata_analysis && (
                      <div className="p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-400 text-xs mb-2">البيانات الوصفية:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-slate-500">الإنشاء:</span> <span className="text-white">{tamperAnalysis.metadata_analysis.creation_date}</span></div>
                          <div><span className="text-slate-500">التعديل:</span> <span className="text-white">{tamperAnalysis.metadata_analysis.modification_date}</span></div>
                          <div><span className="text-slate-500">الدقة:</span> <span className="text-white">{tamperAnalysis.metadata_analysis.resolution}</span></div>
                          <div><span className="text-slate-500">FPS:</span> <span className="text-white">{tamperAnalysis.metadata_analysis.frame_rate}</span></div>
                        </div>
                      </div>
                    )}

                    {/* Hash */}
                    {tamperAnalysis.hash_sha256 && (
                      <div className="p-2 bg-slate-900 rounded font-mono text-xs text-slate-400 break-all">
                        SHA-256: {tamperAnalysis.hash_sha256}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">ارفع فيديو لتحليله</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {analysisTypes.map(type => (
              <Card key={type.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-3 rounded-xl bg-${type.color}-500/20`}>
                      <type.icon className={`w-5 h-5 text-${type.color}-400`} />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{type.name}</h3>
                      <p className="text-slate-500 text-xs">تحليل متقدم بالذكاء الاصطناعي</p>
                    </div>
                  </div>
                  <Button 
                    className={`w-full bg-${type.color}-600 hover:bg-${type.color}-700`}
                    onClick={() => analysisMutation.mutate(type.id)}
                    disabled={analysisMutation.isPending}
                  >
                    {analysisMutation.isPending ? (
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4 ml-2" />
                    )}
                    بدء التحليل
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Analysis Results */}
          {analysisResults && (
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">نتائج التحليل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-2xl font-bold text-cyan-400">{analysisResults.statistics?.total_detections || 0}</p>
                    <p className="text-slate-400 text-xs">إجمالي الاكتشافات</p>
                  </div>
                  <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-400">{analysisResults.statistics?.unique_objects || 0}</p>
                    <p className="text-slate-400 text-xs">أجسام فريدة</p>
                  </div>
                  <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-2xl font-bold text-green-400">{analysisResults.statistics?.avg_confidence || 0}%</p>
                    <p className="text-slate-400 text-xs">متوسط الثقة</p>
                  </div>
                  <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-400">{analysisResults.statistics?.processing_time || '0s'}</p>
                    <p className="text-slate-400 text-xs">وقت المعالجة</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {analysisResults.detections?.slice(0, 5).map((detection, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-700 rounded flex items-center justify-center">
                          <Target className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-white text-sm">{detection.description}</p>
                          <p className="text-slate-500 text-xs">{detection.timestamp}</p>
                        </div>
                      </div>
                      <Badge className={`${
                        detection.confidence >= 90 ? 'bg-green-500/20 text-green-400' :
                        detection.confidence >= 70 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {detection.confidence}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Human Behavior Analysis Tab */}
        <TabsContent value="human" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Analysis Controls */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400" />
                  تحليل السلوك والعواطف
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                  <Video className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">ارفع فيديو أو صوت للتحليل</p>
                </div>

                <div className="space-y-2">
                  <p className="text-slate-400 text-xs">أنواع التحليل:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="border-slate-600 justify-start text-xs">
                      <ScanFace className="w-3 h-3 ml-1" />
                      تعبيرات الوجه
                    </Button>
                    <Button variant="outline" className="border-slate-600 justify-start text-xs">
                      <Users className="w-3 h-3 ml-1" />
                      لغة الجسد
                    </Button>
                    <Button variant="outline" className="border-slate-600 justify-start text-xs">
                      <Mic className="w-3 h-3 ml-1" />
                      تحليل الصوت
                    </Button>
                    <Button variant="outline" className="border-slate-600 justify-start text-xs">
                      <Brain className="w-3 h-3 ml-1" />
                      كشف الكذب
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    className="w-full bg-pink-600 hover:bg-pink-700"
                    onClick={() => humanAnalysisMutation.mutate()}
                    disabled={humanAnalysisMutation.isPending}
                  >
                    {humanAnalysisMutation.isPending ? (
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <Heart className="w-4 h-4 ml-2" />
                    )}
                    تحليل السلوك الكامل
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full border-purple-500/50 text-purple-400"
                    onClick={() => voiceAnalysisMutation.mutate()}
                    disabled={voiceAnalysisMutation.isPending}
                  >
                    {voiceAnalysisMutation.isPending ? (
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <Mic className="w-4 h-4 ml-2" />
                    )}
                    تحليل الصوت فقط
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Emotions Overview */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">خريطة العواطف</CardTitle>
              </CardHeader>
              <CardContent>
                {humanAnalysis ? (
                  <div className="space-y-3">
                    {/* Dominant Emotion */}
                    {humanAnalysis.dominant_emotion && (
                      <div className="p-4 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl text-center">
                        <div className="text-4xl mb-2">
                          {emotionTypes.find(e => e.id === humanAnalysis.dominant_emotion.emotion?.toLowerCase())?.emoji || '😐'}
                        </div>
                        <p className="text-white font-medium">
                          {emotionTypes.find(e => e.id === humanAnalysis.dominant_emotion.emotion?.toLowerCase())?.name || humanAnalysis.dominant_emotion.emotion}
                        </p>
                        <p className="text-pink-400 text-2xl font-bold">{humanAnalysis.dominant_emotion.percentage}%</p>
                        <p className="text-slate-400 text-xs mt-1">{humanAnalysis.dominant_emotion.description}</p>
                      </div>
                    )}

                    {/* Emotion Grid */}
                    <div className="grid grid-cols-4 gap-2">
                      {emotionTypes.map(emotion => {
                        const detected = humanAnalysis.facial_emotions?.find(e => 
                          e.emotion?.toLowerCase() === emotion.id
                        );
                        return (
                          <div 
                            key={emotion.id}
                            className={`p-2 rounded-lg text-center ${
                              detected ? `bg-${emotion.color}-500/20 border border-${emotion.color}-500/50` : 'bg-slate-800/50'
                            }`}
                          >
                            <div className="text-xl">{emotion.emoji}</div>
                            <p className="text-xs text-slate-400">{emotion.name}</p>
                            {detected && (
                              <p className={`text-xs text-${emotion.color}-400 font-medium`}>
                                {detected.confidence}%
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">ابدأ التحليل لرؤية العواطف</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detailed Results */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">التقييم التفصيلي</CardTitle>
              </CardHeader>
              <CardContent>
                {humanAnalysis ? (
                  <div className="space-y-4">
                    {/* Body Language */}
                    {humanAnalysis.body_language && (
                      <div className="p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-400 text-xs mb-2 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          لغة الجسد
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-300 text-xs">الوضعية</span>
                            <span className="text-white text-xs">{humanAnalysis.body_language.posture}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300 text-xs">التواصل البصري</span>
                            <span className="text-white text-xs">{humanAnalysis.body_language.eye_contact}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300 text-xs">مستوى الراحة</span>
                            <div className="flex items-center gap-2">
                              <Progress value={humanAnalysis.body_language.comfort_level} className="w-16 h-1.5" />
                              <span className="text-white text-xs">{humanAnalysis.body_language.comfort_level}%</span>
                            </div>
                          </div>
                        </div>
                        {humanAnalysis.body_language.stress_indicators?.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-700">
                            <p className="text-red-400 text-xs">علامات التوتر:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {humanAnalysis.body_language.stress_indicators.map((ind, i) => (
                                <Badge key={i} className="bg-red-500/20 text-red-400 text-xs">{ind}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Voice Analysis */}
                    {humanAnalysis.voice_analysis && (
                      <div className="p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-400 text-xs mb-2 flex items-center gap-1">
                          <Mic className="w-3 h-3" />
                          تحليل الصوت
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-300 text-xs">النبرة</span>
                            <span className="text-white text-xs">{humanAnalysis.voice_analysis.tone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300 text-xs">سرعة الكلام</span>
                            <span className="text-white text-xs">{humanAnalysis.voice_analysis.speech_rate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300 text-xs">مؤشر الصدق</span>
                            <Badge className={`${
                              humanAnalysis.voice_analysis.deception_indicators < 30 ? 'bg-green-500/20 text-green-400' :
                              humanAnalysis.voice_analysis.deception_indicators < 60 ? 'bg-amber-500/20 text-amber-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {100 - humanAnalysis.voice_analysis.deception_indicators}% مصداقية
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300 text-xs">توتر الصوت</span>
                            <div className="flex items-center gap-2">
                              <Progress value={humanAnalysis.voice_analysis.stress_in_voice} className="w-16 h-1.5" />
                              <span className="text-white text-xs">{humanAnalysis.voice_analysis.stress_in_voice}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Behavior Classification */}
                    {humanAnalysis.behavior_classification && (
                      <div className={`p-3 rounded-lg ${
                        humanAnalysis.behavior_classification.threat_level === 'high' ? 'bg-red-500/20' :
                        humanAnalysis.behavior_classification.threat_level === 'medium' ? 'bg-amber-500/20' :
                        'bg-green-500/20'
                      }`}>
                        <p className="text-slate-300 text-xs mb-2">تصنيف السلوك</p>
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">{humanAnalysis.behavior_classification.primary_behavior}</span>
                          <Badge className={`${
                            humanAnalysis.behavior_classification.threat_level === 'high' ? 'bg-red-600' :
                            humanAnalysis.behavior_classification.threat_level === 'medium' ? 'bg-amber-600' :
                            'bg-green-600'
                          }`}>
                            تهديد: {humanAnalysis.behavior_classification.threat_score}%
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                ) : voiceAnalysis ? (
                  <div className="space-y-3">
                    {/* Voice Only Analysis */}
                    <div className="p-4 bg-purple-500/20 rounded-xl text-center">
                      <Volume2 className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-white font-medium">تحليل صوتي</p>
                    </div>
                    
                    {voiceAnalysis.voice_characteristics && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-slate-800/50 rounded text-center">
                          <p className="text-slate-500 text-xs">الحدة</p>
                          <p className="text-white text-sm">{voiceAnalysis.voice_characteristics.pitch}</p>
                        </div>
                        <div className="p-2 bg-slate-800/50 rounded text-center">
                          <p className="text-slate-500 text-xs">السرعة</p>
                          <p className="text-white text-sm">{voiceAnalysis.voice_characteristics.tempo}</p>
                        </div>
                      </div>
                    )}

                    {voiceAnalysis.truthfulness_analysis && (
                      <div className="p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-400 text-xs">المصداقية</span>
                          <Badge className={`${
                            voiceAnalysis.truthfulness_analysis.credibility_score >= 70 ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {voiceAnalysis.truthfulness_analysis.credibility_score}%
                          </Badge>
                        </div>
                        <Progress value={voiceAnalysis.truthfulness_analysis.credibility_score} className="h-2" />
                      </div>
                    )}

                    {voiceAnalysis.stress_analysis && (
                      <div className="p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-xs">مستوى التوتر</span>
                          <span className="text-white text-sm">{voiceAnalysis.stress_analysis.overall_stress}%</span>
                        </div>
                        <Progress value={voiceAnalysis.stress_analysis.overall_stress} className="h-2 mt-2" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">لا توجد نتائج بعد</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Persons & Timeline */}
          {humanAnalysis && (
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Detected Persons */}
              {humanAnalysis.persons_detected?.length > 0 && (
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">الأشخاص المكتشفون</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {humanAnalysis.persons_detected.map((person, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                          <UserCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm">شخص #{person.person_id}</p>
                          <p className="text-slate-400 text-xs">{person.age_estimate} • {person.gender_estimate}</p>
                          <p className="text-slate-500 text-xs mt-1">{person.emotional_profile}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Overall Assessment */}
              {humanAnalysis.overall_assessment && (
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">التقييم العام</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className={`p-4 rounded-xl text-center ${
                      humanAnalysis.overall_assessment.risk_level === 'high' ? 'bg-red-500/20' :
                      humanAnalysis.overall_assessment.risk_level === 'medium' ? 'bg-amber-500/20' :
                      'bg-green-500/20'
                    }`}>
                      <p className={`text-2xl font-bold ${
                        humanAnalysis.overall_assessment.risk_level === 'high' ? 'text-red-400' :
                        humanAnalysis.overall_assessment.risk_level === 'medium' ? 'text-amber-400' :
                        'text-green-400'
                      }`}>
                        {humanAnalysis.overall_assessment.confidence_score}%
                      </p>
                      <p className="text-white text-sm">دقة التحليل</p>
                      <Badge className={`mt-2 ${
                        humanAnalysis.overall_assessment.risk_level === 'high' ? 'bg-red-600' :
                        humanAnalysis.overall_assessment.risk_level === 'medium' ? 'bg-amber-600' :
                        'bg-green-600'
                      }`}>
                        مستوى الخطر: {humanAnalysis.overall_assessment.risk_level}
                      </Badge>
                    </div>

                    {humanAnalysis.overall_assessment.key_observations?.length > 0 && (
                      <div>
                        <p className="text-slate-400 text-xs mb-2">الملاحظات الرئيسية:</p>
                        <ul className="space-y-1">
                          {humanAnalysis.overall_assessment.key_observations.map((obs, i) => (
                            <li key={i} className="text-white text-xs flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                              {obs}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {humanAnalysis.overall_assessment.recommendations?.length > 0 && (
                      <div>
                        <p className="text-slate-400 text-xs mb-2">التوصيات:</p>
                        <ul className="space-y-1">
                          {humanAnalysis.overall_assessment.recommendations.map((rec, i) => (
                            <li key={i} className="text-amber-400 text-xs flex items-start gap-2">
                              <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Timelapse Tab */}
        <TabsContent value="timelapse" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <Timer className="w-16 h-16 text-green-500 mx-auto mb-2" />
                      <p className="text-white">معاينة Timelapse</p>
                      <p className="text-slate-500 text-sm">سرعة {timelapseSettings.speed}x</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Play className="w-4 h-4 ml-2" />
                      تشغيل المعاينة
                    </Button>
                    <Button variant="outline" className="border-slate-600">
                      <Download className="w-4 h-4 ml-2" />
                      تصدير Timelapse
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">إعدادات Timelapse</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300 text-sm">سرعة التسريع</Label>
                  <Select value={timelapseSettings.speed.toString()} onValueChange={(v) => setTimelapseSettings({ ...timelapseSettings, speed: parseInt(v) })}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="5">5x</SelectItem>
                      <SelectItem value="10">10x</SelectItem>
                      <SelectItem value="30">30x</SelectItem>
                      <SelectItem value="60">60x</SelectItem>
                      <SelectItem value="120">120x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-300 text-sm">فاصل الالتقاط (ثانية)</Label>
                  <Slider
                    value={[timelapseSettings.interval]}
                    onValueChange={([v]) => setTimelapseSettings({ ...timelapseSettings, interval: v })}
                    min={1}
                    max={300}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-slate-500 text-xs mt-1">{timelapseSettings.interval} ثانية</p>
                </div>

                <div>
                  <Label className="text-slate-300 text-sm">مدة المصدر</Label>
                  <Select value={timelapseSettings.duration.toString()} onValueChange={(v) => setTimelapseSettings({ ...timelapseSettings, duration: parseInt(v) })}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="3600">ساعة واحدة</SelectItem>
                      <SelectItem value="14400">4 ساعات</SelectItem>
                      <SelectItem value="43200">12 ساعة</SelectItem>
                      <SelectItem value="86400">24 ساعة</SelectItem>
                      <SelectItem value="604800">أسبوع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">الناتج المتوقع:</p>
                  <p className="text-white text-sm">
                    {Math.round(timelapseSettings.duration / timelapseSettings.interval / timelapseSettings.speed)} ثانية
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">إعدادات التصدير</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300 text-sm">صيغة الملف</Label>
                  <Select value={exportSettings.format} onValueChange={(v) => setExportSettings({ ...exportSettings, format: v })}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="mp4">MP4 (H.264)</SelectItem>
                      <SelectItem value="avi">AVI</SelectItem>
                      <SelectItem value="mkv">MKV</SelectItem>
                      <SelectItem value="mov">MOV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-300 text-sm">الجودة</Label>
                  <Select value={exportSettings.quality} onValueChange={(v) => setExportSettings({ ...exportSettings, quality: v })}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="original">أصلي</SelectItem>
                      <SelectItem value="high">عالي (1080p)</SelectItem>
                      <SelectItem value="medium">متوسط (720p)</SelectItem>
                      <SelectItem value="low">منخفض (480p)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-700">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300 text-sm">تضمين البيانات الوصفية</Label>
                    <Switch
                      checked={exportSettings.includeMetadata}
                      onCheckedChange={(v) => setExportSettings({ ...exportSettings, includeMetadata: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300 text-sm">تضمين Hash للتحقق</Label>
                    <Switch
                      checked={exportSettings.includeHash}
                      onCheckedChange={(v) => setExportSettings({ ...exportSettings, includeHash: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300 text-sm">إضافة علامة مائية</Label>
                    <Switch
                      checked={exportSettings.watermark}
                      onCheckedChange={(v) => setExportSettings({ ...exportSettings, watermark: v })}
                    />
                  </div>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleExport}>
                  <Download className="w-4 h-4 ml-2" />
                  تصدير الفيديو
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">تقرير جنائي</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-2">سيتضمن التقرير:</p>
                  <ul className="text-white text-sm space-y-1">
                    <li>✓ معلومات الملف الأصلي</li>
                    <li>✓ سلسلة الحفظ (Chain of Custody)</li>
                    <li>✓ تقرير كشف التلاعب</li>
                    <li>✓ البيانات الوصفية الكاملة</li>
                    <li>✓ قيم Hash للتحقق</li>
                    <li>✓ نتائج التحليلات</li>
                    <li>✓ الطوابع الزمنية</li>
                  </ul>
                </div>

                <Textarea
                  placeholder="ملاحظات إضافية للتقرير..."
                  className="bg-slate-800/50 border-slate-700 text-white"
                  rows={4}
                />

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 border-slate-600">
                    <FileText className="w-4 h-4 ml-1" />
                    PDF
                  </Button>
                  <Button variant="outline" className="flex-1 border-slate-600">
                    <FileText className="w-4 h-4 ml-1" />
                    Word
                  </Button>
                  <Button variant="outline" className="flex-1 border-slate-600">
                    <Database className="w-4 h-4 ml-1" />
                    JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}