import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Brain, Camera, Users, Car, Shield, ShoppingBag, Activity,
  AlertTriangle, Target, Zap, TrendingUp, Heart, Flame, Wind, Search,
  Filter, Grid3X3, List, Play, Pause, RefreshCw, Settings, BarChart3,
  Cpu, Layers, Sparkles, ChevronDown, ChevronUp, CheckCircle, Bell, FileText,
  Database, Rocket, Scale, Gavel, Store, Workflow, LineChart, LayoutGrid,
  ChevronLeft, ChevronRight, Gauge, ScanEye, Radar, Network, Boxes,
  MonitorDot, BrainCircuit, ShieldCheck, Crosshair, Telescope
} from 'lucide-react';
import AIVisionReporting from '@/components/vision/AIVisionReporting';
import AIVisionAlerts from '@/components/vision/AIVisionAlerts';
import AIModelManagement from '@/components/vision/AIModelManagement';
import AIDataPipelineOptimizer from '@/components/vision/AIDataPipelineOptimizer';
import AIGovernanceModule from '@/components/vision/AIGovernanceModule';
import AIDeploymentLifecycle from '@/components/vision/AIDeploymentLifecycle';
import AIModelMarketplace from '@/components/vision/AIModelMarketplace';
import AIGovernanceDashboard from '@/components/vision/AIGovernanceDashboard';
import AIThreatIntelligence from '@/components/vision/AIThreatIntelligence';
import AIMLOpsWorkflows from '@/components/vision/AIMLOpsWorkflows';
import AIModelPerformanceInsights from '@/components/vision/AIModelPerformanceInsights';
import AIRealTimeCollaboration from '@/components/vision/AIRealTimeCollaboration';
import AIAdvancedMLOps from '@/components/vision/AIAdvancedMLOps';
import AIAdvancedGovernance from '@/components/vision/AIAdvancedGovernance';
import AISmartOnboarding from '@/components/vision/AISmartOnboarding';
import AIProactiveAnomalyDetector from '@/components/ai/AIProactiveAnomalyDetector';
import AIAutomatedReportGenerator from '@/components/ai/AIAutomatedReportGenerator';
import AICustomizableDashboard from '@/components/dashboard/AICustomizableDashboard';
import AIPredictiveAnalytics from '@/components/ai/AIPredictiveAnalytics';
import AIRealTimeModelMonitor from '@/components/ai/AIRealTimeModelMonitor';
import AIModelFailurePrediction from '@/components/ai/AIModelFailurePrediction';
import AIAutoResponseSystem from '@/components/ai/AIAutoResponseSystem';
import AIAdvancedAnomalyTraining from '@/components/ai/AIAdvancedAnomalyTraining';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// 250+ AI Vision Models - Enhanced with Advanced Behavior & Threat Detection
const aiModels = [
  // ===== ADVANCED USER BEHAVIOR ANALYSIS =====
  // Body Language Analysis (NEW)
  { id: 'face-recognition', name: 'التعرف على الوجوه VIP/Blacklist', category: 'people_analytics', accuracy: 98.5, detections: 15420, isNew: false },
  { id: 'people-counting', name: 'عدّ الأشخاص والحشود', category: 'people_analytics', accuracy: 96.2, detections: 28900 },
  { id: 'age-gender', name: 'تحليل العمر والجنس', category: 'people_analytics', accuracy: 94.1, detections: 12300 },
  { id: 'emotion-detection', name: 'تحليل المشاعر وتعابير الوجه', category: 'people_analytics', accuracy: 91.8, detections: 8920 },
  
  // Body Language Deep Analysis (NEW CATEGORY)
  { id: 'body-language-deep', name: 'تحليل لغة الجسد العميق Deep Body Language AI', category: 'behavior_analysis', accuracy: 94.2, detections: 8900, isNew: true },
  { id: 'posture-analysis', name: 'تحليل وضعية الجسم Posture Analysis', category: 'behavior_analysis', accuracy: 92.8, detections: 6700, isNew: true },
  { id: 'hand-gesture-ai', name: 'تحليل إيماءات اليد Hand Gesture Recognition', category: 'behavior_analysis', accuracy: 93.5, detections: 12300, isNew: true },
  { id: 'eye-tracking-ai', name: 'تتبع حركة العين Eye Movement Tracking', category: 'behavior_analysis', accuracy: 95.1, detections: 8900, isNew: true },
  { id: 'facial-micro-movements', name: 'الحركات الدقيقة للوجه Facial Micro-Movements', category: 'behavior_analysis', accuracy: 89.7, detections: 4500, isNew: true },
  { id: 'body-tension-detector', name: 'كشف توتر الجسم Body Tension Detector', category: 'behavior_analysis', accuracy: 88.4, detections: 3200, isNew: true },
  { id: 'nervous-behavior', name: 'كشف السلوك العصبي Nervous Behavior Detection', category: 'behavior_analysis', accuracy: 87.9, detections: 2800, isNew: true },
  { id: 'deception-indicators', name: 'مؤشرات الخداع Deception Indicator AI', category: 'behavior_analysis', accuracy: 86.5, detections: 1900, isNew: true },
  
  // Intent Detection (NEW CATEGORY)
  { id: 'intent-prediction-v2', name: 'التنبؤ بالنوايا المتقدم Advanced Intent Prediction', category: 'intent_detection', accuracy: 91.3, detections: 5600, isNew: true },
  { id: 'pre-crime-behavior', name: 'كشف سلوك ما قبل الجريمة Pre-Crime Behavior AI', category: 'intent_detection', accuracy: 89.8, detections: 890, isNew: true },
  { id: 'hostile-intent', name: 'كشف النوايا العدائية Hostile Intent Detection', category: 'intent_detection', accuracy: 92.4, detections: 450, isNew: true },
  { id: 'approach-pattern', name: 'تحليل نمط الاقتراب Approach Pattern Analysis', category: 'intent_detection', accuracy: 90.6, detections: 2300, isNew: true },
  { id: 'loitering-intent', name: 'كشف نية التسكع Loitering Intent AI', category: 'intent_detection', accuracy: 88.9, detections: 3400, isNew: true },
  { id: 'escape-planning', name: 'كشف التخطيط للهروب Escape Planning Detection', category: 'intent_detection', accuracy: 87.2, detections: 120, isNew: true },
  { id: 'reconnaissance-behavior', name: 'سلوك الاستطلاع Reconnaissance Behavior AI', category: 'intent_detection', accuracy: 91.7, detections: 340, isNew: true },
  { id: 'target-selection', name: 'كشف اختيار الهدف Target Selection Detection', category: 'intent_detection', accuracy: 88.1, detections: 78, isNew: true },
  
  // Legacy People Analytics
  { id: 'body-language', name: 'AI Body Language Risk Scoring', category: 'people_analytics', accuracy: 89.5, detections: 4560 },
  { id: 'micro-expression', name: 'Micro-Expression AI', category: 'people_analytics', accuracy: 87.3, detections: 2340 },
  { id: 'intent-prediction', name: 'Human Intent Prediction', category: 'people_analytics', accuracy: 85.6, detections: 1890 },
  { id: 'gait-analysis', name: 'تحليل نمط المشي Gait Analysis', category: 'people_analytics', accuracy: 88.4, detections: 3200 },
  { id: 'stress-detection', name: 'كشف التوتر والقلق', category: 'people_analytics', accuracy: 84.2, detections: 1560 },
  { id: 'aggression-predict', name: 'التنبؤ بالسلوك العدواني', category: 'people_analytics', accuracy: 86.7, detections: 890 },
  { id: 'attention-tracking', name: 'تتبع الانتباه والتركيز', category: 'people_analytics', accuracy: 91.3, detections: 4500 },
  
  // Vehicle Analytics
  { id: 'anpr-lpn', name: 'ANPR/LPR - قراءة اللوحات', category: 'vehicle_analytics', accuracy: 97.8, detections: 45200 },
  { id: 'vehicle-type', name: 'تصنيف أنواع المركبات', category: 'vehicle_analytics', accuracy: 95.4, detections: 38900 },
  { id: 'plate-spoofing', name: 'License Plate Spoofing Detection', category: 'vehicle_analytics', accuracy: 93.2, detections: 340 },
  { id: 'emergency-vehicle', name: 'AI Emergency Vehicle Recognition', category: 'vehicle_analytics', accuracy: 99.1, detections: 1250 },
  { id: 'vehicle-damage', name: 'Car Damage Detection', category: 'vehicle_analytics', accuracy: 92.7, detections: 2100 },
  { id: 'stolen-pattern', name: 'Vehicle Stolen Pattern Detection', category: 'vehicle_analytics', accuracy: 88.9, detections: 145 },
  
  // ===== ADVANCED THREAT DETECTION SYSTEM =====
  // Concealed Weapon Detection (ENHANCED)
  { id: 'weapon-detection', name: 'كشف الأسلحة الظاهرة', category: 'security', accuracy: 96.5, detections: 89 },
  { id: 'concealed-weapon-thermal', name: 'كشف الأسلحة المخفية (Thermal AI)', category: 'threat_detection', accuracy: 94.8, detections: 67, isNew: true },
  { id: 'concealed-weapon-xray', name: 'كشف الأسلحة بالأشعة X-Ray Vision AI', category: 'threat_detection', accuracy: 96.2, detections: 45, isNew: true },
  { id: 'weapon-bulge-detection', name: 'كشف انتفاخ السلاح Weapon Bulge AI', category: 'threat_detection', accuracy: 91.3, detections: 234, isNew: true },
  { id: 'weapon-print-detection', name: 'كشف طبعة السلاح Weapon Print Detection', category: 'threat_detection', accuracy: 89.7, detections: 178, isNew: true },
  { id: 'metallic-object-ai', name: 'كشف الأجسام المعدنية Metallic Object AI', category: 'threat_detection', accuracy: 93.4, detections: 890, isNew: true },
  
  // Advanced Intrusion Detection (ENHANCED)
  { id: 'intrusion-ai-v2', name: 'كشف التسلل المتقدم Advanced Intrusion AI', category: 'threat_detection', accuracy: 97.8, detections: 234, isNew: true },
  { id: 'fence-climbing', name: 'كشف تسلق الأسوار Fence Climbing Detection', category: 'threat_detection', accuracy: 96.1, detections: 89, isNew: true },
  { id: 'tunnel-detection', name: 'كشف الأنفاق Underground Tunnel AI', category: 'threat_detection', accuracy: 92.4, detections: 12, isNew: true },
  { id: 'window-breach', name: 'كشف اختراق النوافذ Window Breach AI', category: 'threat_detection', accuracy: 95.6, detections: 45, isNew: true },
  { id: 'lock-picking', name: 'كشف فتح الأقفال Lock Picking Detection', category: 'threat_detection', accuracy: 88.9, detections: 34, isNew: true },
  { id: 'forced-entry', name: 'كشف الدخول القسري Forced Entry AI', category: 'threat_detection', accuracy: 94.7, detections: 78, isNew: true },
  { id: 'bypass-attempt', name: 'كشف محاولات التجاوز Bypass Attempt Detection', category: 'threat_detection', accuracy: 91.2, detections: 156, isNew: true },
  
  // Cyber-Physical Attack Detection (NEW)
  { id: 'camera-tampering', name: 'كشف العبث بالكاميرات Camera Tampering AI', category: 'threat_detection', accuracy: 97.3, detections: 23, isNew: true },
  { id: 'laser-attack', name: 'كشف هجمات الليزر Laser Attack Detection', category: 'threat_detection', accuracy: 94.1, detections: 8, isNew: true },
  { id: 'signal-jamming', name: 'كشف التشويش Signal Jamming Detection', category: 'threat_detection', accuracy: 92.8, detections: 15, isNew: true },
  { id: 'spoofing-attack', name: 'كشف هجمات التزييف Spoofing Attack AI', category: 'threat_detection', accuracy: 89.5, detections: 12, isNew: true },
  
  // Legacy Security Models
  { id: 'concealed-weapon', name: 'كشف الأسلحة المخفية (Thermal)', category: 'security', accuracy: 92.1, detections: 45 },
  { id: 'knife-detection', name: 'كشف الأدوات الحادة', category: 'security', accuracy: 94.8, detections: 156 },
  { id: 'violence-detection', name: 'كشف العنف والشغب', category: 'security', accuracy: 94.2, detections: 234 },
  { id: 'intrusion', name: 'كشف التسلل', category: 'security', accuracy: 95.8, detections: 456 },
  { id: 'suspicious-behavior', name: 'السلوك المشبوه', category: 'security', accuracy: 91.3, detections: 1890 },
  { id: 'bag-opening', name: 'AI Bag Opening Detection', category: 'security', accuracy: 89.4, detections: 234 },
  { id: 'hiding-pattern', name: 'Human Hiding Pattern AI', category: 'security', accuracy: 87.8, detections: 120 },
  { id: 'perimeter-breach', name: 'كشف اختراق المحيط', category: 'security', accuracy: 97.2, detections: 78 },
  { id: 'tailgating', name: 'كشف Tailgating/Piggybacking', category: 'security', accuracy: 93.5, detections: 245 },
  { id: 'cyber-visual', name: 'كشف محاولات الاختراق البصري', category: 'security', accuracy: 88.9, detections: 34 },
  { id: 'drone-detection', name: 'كشف الطائرات المسيرة', category: 'security', accuracy: 95.6, detections: 12 },
  
  // Crowd Analytics
  { id: 'crowd-density', name: 'كثافة الحشود', category: 'crowd', accuracy: 97.3, detections: 23400 },
  { id: 'crowd-behavior', name: 'تحليل سلوك الحشود', category: 'crowd', accuracy: 93.5, detections: 8900 },
  { id: 'crowd-compression', name: 'Hazardous Crowd Compression', category: 'crowd', accuracy: 96.7, detections: 23 },
  { id: 'crowd-shockwave', name: 'Crowd Shockwave Prediction', category: 'crowd', accuracy: 94.1, detections: 12 },
  { id: 'crowd-evacuation', name: 'Crowd Evacuation Control', category: 'crowd', accuracy: 95.8, detections: 5 },
  
  // Safety
  { id: 'fall-detection', name: 'كشف السقوط', category: 'safety', accuracy: 98.1, detections: 456 },
  { id: 'ppe-detection', name: 'كشف معدات السلامة PPE', category: 'safety', accuracy: 96.4, detections: 3400 },
  { id: 'fire-smoke', name: 'كشف الحريق والدخان', category: 'safety', accuracy: 97.9, detections: 89 },
  { id: 'slip-prediction', name: 'Human Slip Prediction', category: 'safety', accuracy: 91.2, detections: 234 },
  { id: 'heat-stress', name: 'Crowd Heat Stress Prediction', category: 'safety', accuracy: 93.6, detections: 67 },
  
  // Retail
  { id: 'queue-analysis', name: 'تحليل الطوابير', category: 'retail', accuracy: 95.7, detections: 12300 },
  { id: 'shoplifting', name: 'Shoplifting & Theft AI', category: 'retail', accuracy: 92.4, detections: 890 },
  { id: 'customer-journey', name: 'Customer Journey Mapping', category: 'retail', accuracy: 94.8, detections: 45600 },
  { id: 'store-layout', name: 'Store Layout Optimization', category: 'retail', accuracy: 89.3, detections: 2340 },
  
  // Environment
  { id: 'flood-detection', name: 'AI Flood Level Detection', category: 'environment', accuracy: 95.2, detections: 23 },
  { id: 'air-pollution', name: 'Smog / Air Pollution Vision', category: 'environment', accuracy: 88.7, detections: 1200 },
  { id: 'waste-overflow', name: 'Garbage Overflow Vision', category: 'environment', accuracy: 96.1, detections: 890 },
  { id: 'gas-leak-detection', name: 'كشف تسرب الغاز Gas Leak Detection', category: 'environment', accuracy: 93.4, detections: 45, isNew: true },
  { id: 'chemical-spill', name: 'كشف الانسكابات الكيميائية Chemical Spill AI', category: 'environment', accuracy: 91.8, detections: 12, isNew: true },
  { id: 'radiation-detection', name: 'كشف الإشعاع Radiation Detection AI', category: 'environment', accuracy: 88.9, detections: 8, isNew: true },
  { id: 'water-quality', name: 'تحليل جودة المياه Water Quality Vision', category: 'environment', accuracy: 90.2, detections: 340, isNew: true },
  
  // Traffic
  { id: 'traffic-violation', name: 'كشف المخالفات المرورية', category: 'traffic', accuracy: 97.2, detections: 8900 },
  { id: 'dangerous-driving', name: 'Dangerous Driving Behavior', category: 'traffic', accuracy: 94.5, detections: 2340 },
  { id: 'crosswalk-safety', name: 'Crosswalk AI Safety', category: 'traffic', accuracy: 96.8, detections: 456 },
  { id: 'parking-violation', name: 'كشف مخالفات المواقف', category: 'traffic', accuracy: 95.3, detections: 5670 },
  { id: 'accident-prediction', name: 'التنبؤ بالحوادث Accident Prediction AI', category: 'traffic', accuracy: 89.7, detections: 234, isNew: true },
  { id: 'road-condition', name: 'تقييم حالة الطريق Road Condition Assessment', category: 'traffic', accuracy: 92.1, detections: 1560, isNew: true },
  { id: 'traffic-flow-optimizer', name: 'تحسين تدفق المرور Traffic Flow Optimizer', category: 'traffic', accuracy: 94.3, detections: 23400, isNew: true },
  
  // ===== ADDITIONAL CATEGORIES =====
  // Medical & Healthcare
  { id: 'patient-fall', name: 'كشف سقوط المرضى Patient Fall Detection', category: 'medical', accuracy: 98.2, detections: 890, isNew: true },
  { id: 'ppe-compliance-hospital', name: 'التزام معدات الحماية بالمستشفى', category: 'medical', accuracy: 96.5, detections: 4500, isNew: true },
  { id: 'patient-distress', name: 'كشف ضيق المريض Patient Distress AI', category: 'medical', accuracy: 93.7, detections: 670, isNew: true },
  { id: 'bed-occupancy', name: 'رصد إشغال الأسرة Bed Occupancy Tracking', category: 'medical', accuracy: 97.8, detections: 12300, isNew: true },
  { id: 'hand-hygiene', name: 'مراقبة نظافة اليدين Hand Hygiene Monitor', category: 'medical', accuracy: 91.4, detections: 8900, isNew: true },
  
  // Industrial & Manufacturing
  { id: 'defect-detection', name: 'كشف العيوب الصناعية Industrial Defect Detection', category: 'industrial', accuracy: 97.5, detections: 45600, isNew: true },
  { id: 'assembly-verification', name: 'التحقق من التجميع Assembly Verification AI', category: 'industrial', accuracy: 96.2, detections: 34500, isNew: true },
  { id: 'worker-safety-zone', name: 'مراقبة مناطق الأمان للعمال', category: 'industrial', accuracy: 95.8, detections: 23400, isNew: true },
  { id: 'equipment-malfunction', name: 'كشف أعطال المعدات Equipment Malfunction AI', category: 'industrial', accuracy: 93.9, detections: 1560, isNew: true },
  { id: 'production-quality', name: 'مراقبة جودة الإنتاج Production Quality AI', category: 'industrial', accuracy: 94.6, detections: 67800, isNew: true },
  
  // Agriculture
  { id: 'crop-health', name: 'تقييم صحة المحاصيل Crop Health Assessment', category: 'agriculture', accuracy: 92.8, detections: 5600, isNew: true },
  { id: 'pest-detection', name: 'كشف الآفات Pest Detection AI', category: 'agriculture', accuracy: 91.3, detections: 2340, isNew: true },
  { id: 'irrigation-monitor', name: 'مراقبة الري Irrigation Monitoring', category: 'agriculture', accuracy: 89.7, detections: 12300, isNew: true },
  { id: 'livestock-tracking', name: 'تتبع الماشية Livestock Tracking AI', category: 'agriculture', accuracy: 94.2, detections: 8900, isNew: true },
  
  // Construction
  { id: 'construction-safety', name: 'سلامة مواقع البناء Construction Safety AI', category: 'construction', accuracy: 96.3, detections: 3400, isNew: true },
  { id: 'equipment-usage', name: 'مراقبة استخدام المعدات Equipment Usage Tracking', category: 'construction', accuracy: 93.7, detections: 5600, isNew: true },
  { id: 'progress-monitoring', name: 'مراقبة تقدم البناء Progress Monitoring AI', category: 'construction', accuracy: 91.8, detections: 2340, isNew: true },
  { id: 'material-tracking', name: 'تتبع المواد Material Tracking Vision', category: 'construction', accuracy: 90.5, detections: 4500, isNew: true },

  // ===== LOW-LIGHT & COMPLEX ENVIRONMENT (ENHANCED) =====
  // Advanced Low-Light Recognition
  { id: 'lowlight-recognition-v2', name: 'التعرف المتقدم في الإضاءة المنخفضة Enhanced Low-Light AI', category: 'low_light', accuracy: 96.8, detections: 23400, isNew: true },
  { id: 'zero-light-detection', name: 'الكشف في الظلام التام Zero-Light Detection', category: 'low_light', accuracy: 94.2, detections: 8900, isNew: true },
  { id: 'starlight-vision', name: 'الرؤية بضوء النجوم Starlight Vision AI', category: 'low_light', accuracy: 92.7, detections: 5600, isNew: true },
  { id: 'moonlight-enhancement', name: 'تحسين ضوء القمر Moonlight Enhancement', category: 'low_light', accuracy: 93.4, detections: 4500, isNew: true },
  { id: 'infrared-color-fusion', name: 'دمج الألوان مع الأشعة تحت الحمراء IR Color Fusion', category: 'low_light', accuracy: 95.1, detections: 12300, isNew: true },
  
  // Thermal & Multi-Spectral
  { id: 'thermal-fusion-v2', name: 'دمج حراري متقدم Advanced Thermal Fusion', category: 'low_light', accuracy: 97.3, detections: 7800, isNew: true },
  { id: 'multi-spectral-ai', name: 'التحليل متعدد الأطياف Multi-Spectral AI', category: 'low_light', accuracy: 94.9, detections: 3400, isNew: true },
  { id: 'hyperspectral-detection', name: 'الكشف فوق الطيفي Hyperspectral Detection', category: 'low_light', accuracy: 91.6, detections: 1200, isNew: true },
  
  // Complex Environment Handling
  { id: 'fog-penetration', name: 'اختراق الضباب الكثيف Dense Fog Penetration AI', category: 'complex_env', accuracy: 93.8, detections: 2300, isNew: true },
  { id: 'rain-snow-detection', name: 'الكشف أثناء المطر والثلج Rain/Snow Detection AI', category: 'complex_env', accuracy: 92.4, detections: 4500, isNew: true },
  { id: 'dust-storm-vision', name: 'الرؤية في العواصف الرملية Dust Storm Vision', category: 'complex_env', accuracy: 89.7, detections: 890, isNew: true },
  { id: 'smoke-penetration', name: 'اختراق الدخان Smoke Penetration AI', category: 'complex_env', accuracy: 91.2, detections: 1560, isNew: true },
  { id: 'underwater-detection', name: 'الكشف تحت الماء Underwater Detection AI', category: 'complex_env', accuracy: 88.5, detections: 340, isNew: true },
  { id: 'reflection-removal', name: 'إزالة الانعكاسات المتقدمة Advanced Reflection Removal', category: 'complex_env', accuracy: 94.1, detections: 6700, isNew: true },
  { id: 'motion-blur-correction', name: 'تصحيح ضبابية الحركة Motion Blur Correction', category: 'complex_env', accuracy: 93.6, detections: 8900, isNew: true },
  { id: 'occlusion-handling', name: 'معالجة العوائق Occlusion Handling AI', category: 'complex_env', accuracy: 90.8, detections: 5600, isNew: true },
  
  // Legacy Environment Models
  { id: 'lowlight-recognition', name: 'التعرف في الإضاءة المنخفضة', category: 'environment', accuracy: 91.4, detections: 8900 },
  { id: 'thermal-fusion', name: 'دمج الحراري والبصري', category: 'environment', accuracy: 94.7, detections: 3400 },
  { id: 'fog-enhancement', name: 'تحسين الرؤية في الضباب', category: 'environment', accuracy: 89.2, detections: 1200 },
  { id: 'rain-detection', name: 'التعرف أثناء المطر', category: 'environment', accuracy: 87.8, detections: 2300 },
  { id: 'night-vision-ai', name: 'الرؤية الليلية المحسنة', category: 'environment', accuracy: 92.6, detections: 15600 },
  { id: 'glare-compensation', name: 'تعويض الوهج والانعكاس', category: 'environment', accuracy: 90.1, detections: 4500 },
  { id: 'shadow-removal', name: 'إزالة الظلال والتشويش', category: 'environment', accuracy: 88.5, detections: 7800 },
  
  // ===== ADVANCED ANALYTICS & INSIGHTS =====
  // Behavioral Patterns
  { id: 'pattern-anomaly', name: 'كشف الأنماط الشاذة Pattern Anomaly Detection', category: 'analytics', accuracy: 92.3, detections: 4560, isNew: true },
  { id: 'time-series-forecast', name: 'التنبؤ بالسلاسل الزمنية Time Series Forecasting', category: 'analytics', accuracy: 89.8, detections: 2340, isNew: true },
  { id: 'correlation-analysis', name: 'تحليل الارتباطات Correlation Analysis AI', category: 'analytics', accuracy: 91.5, detections: 1890, isNew: true },
  { id: 'predictive-maintenance-vision', name: 'الصيانة التنبؤية البصرية', category: 'analytics', accuracy: 94.7, detections: 3400, isNew: true },
  
  // Object Tracking & Recognition
  { id: 'multi-object-tracking', name: 'تتبع متعدد الأجسام Multi-Object Tracking', category: 'tracking', accuracy: 95.6, detections: 67800, isNew: true },
  { id: 're-identification', name: 'إعادة التعرف Re-Identification AI', category: 'tracking', accuracy: 93.2, detections: 23400, isNew: true },
  { id: 'object-counting', name: 'عد الأجسام Object Counting AI', category: 'tracking', accuracy: 97.1, detections: 45600, isNew: true },
  { id: 'trajectory-prediction', name: 'التنبؤ بالمسار Trajectory Prediction', category: 'tracking', accuracy: 90.8, detections: 12300, isNew: true },
  
  // Biometric & Identity
  { id: 'iris-recognition', name: 'التعرف على قزحية العين Iris Recognition', category: 'biometric', accuracy: 99.2, detections: 5600, isNew: true },
  { id: 'palm-vein', name: 'التعرف على أوردة الكف Palm Vein Recognition', category: 'biometric', accuracy: 98.7, detections: 3400, isNew: true },
  { id: 'gait-biometric', name: 'التعرف البيومتري بالمشي Gait Biometric ID', category: 'biometric', accuracy: 94.5, detections: 8900, isNew: true },
  { id: 'voice-lip-sync', name: 'مطابقة الصوت والشفاه Voice-Lip Sync Detection', category: 'biometric', accuracy: 92.3, detections: 4560, isNew: true },
  
  // Document & OCR
  { id: 'document-forgery', name: 'كشف تزوير المستندات Document Forgery Detection', category: 'document', accuracy: 96.8, detections: 890, isNew: true },
  { id: 'id-verification', name: 'التحقق من الهوية ID Verification AI', category: 'document', accuracy: 97.5, detections: 12300, isNew: true },
  { id: 'signature-verification', name: 'التحقق من التوقيع Signature Verification', category: 'document', accuracy: 95.2, detections: 5600, isNew: true },
  { id: 'qr-barcode-advanced', name: 'قراءة QR/Barcode متقدمة', category: 'document', accuracy: 98.9, detections: 67800, isNew: true },
  
  // Sports & Recreation
  { id: 'player-tracking', name: 'تتبع اللاعبين Player Tracking AI', category: 'sports', accuracy: 96.3, detections: 23400, isNew: true },
  { id: 'ball-trajectory', name: 'تتبع مسار الكرة Ball Trajectory Analysis', category: 'sports', accuracy: 94.7, detections: 12300, isNew: true },
  { id: 'referee-assist', name: 'مساعدة الحكم Referee Assistance AI', category: 'sports', accuracy: 92.8, detections: 4560, isNew: true },
  { id: 'fitness-posture', name: 'تحليل وضعية اللياقة Fitness Posture Analysis', category: 'sports', accuracy: 93.5, detections: 8900, isNew: true },
  
  // Wildlife & Conservation
  { id: 'animal-detection', name: 'كشف الحيوانات Animal Detection AI', category: 'wildlife', accuracy: 95.8, detections: 5600, isNew: true },
  { id: 'species-classification', name: 'تصنيف الأنواع Species Classification', category: 'wildlife', accuracy: 93.6, detections: 3400, isNew: true },
  { id: 'poaching-detection', name: 'كشف الصيد الجائر Poaching Detection', category: 'wildlife', accuracy: 91.2, detections: 120, isNew: true },
  { id: 'habitat-monitoring', name: 'مراقبة الموائل Habitat Monitoring AI', category: 'wildlife', accuracy: 89.9, detections: 2340, isNew: true },
  
  // Food & Quality Control
  { id: 'food-quality', name: 'فحص جودة الطعام Food Quality Inspection', category: 'food', accuracy: 96.7, detections: 34500, isNew: true },
  { id: 'contamination-detection', name: 'كشف التلوث Contamination Detection', category: 'food', accuracy: 95.3, detections: 1560, isNew: true },
  { id: 'portion-size', name: 'قياس حجم الحصة Portion Size Measurement', category: 'food', accuracy: 93.8, detections: 23400, isNew: true },
  { id: 'freshness-assessment', name: 'تقييم الطزاجة Freshness Assessment AI', category: 'food', accuracy: 91.5, detections: 12300, isNew: true },
  
  // Smart City
  { id: 'infrastructure-monitoring', name: 'مراقبة البنية التحتية Infrastructure Monitor', category: 'smart_city', accuracy: 94.2, detections: 8900, isNew: true },
  { id: 'pothole-detection', name: 'كشف الحفر Pothole Detection AI', category: 'smart_city', accuracy: 96.1, detections: 3400, isNew: true },
  { id: 'graffiti-detection', name: 'كشف الكتابة على الجدران Graffiti Detection', category: 'smart_city', accuracy: 92.7, detections: 1560, isNew: true },
  { id: 'street-light-monitor', name: 'مراقبة أعمدة الإنارة Street Light Monitor', category: 'smart_city', accuracy: 95.4, detections: 23400, isNew: true },
  { id: 'public-space-occupancy', name: 'إشغال المساحات العامة', category: 'smart_city', accuracy: 93.9, detections: 45600, isNew: true },
  
  // Education
  { id: 'attendance-tracking', name: 'تتبع الحضور Attendance Tracking AI', category: 'education', accuracy: 97.3, detections: 12300, isNew: true },
  { id: 'student-engagement', name: 'قياس تفاعل الطلاب Student Engagement Monitor', category: 'education', accuracy: 88.6, detections: 8900, isNew: true },
  { id: 'classroom-safety', name: 'سلامة الفصل الدراسي Classroom Safety AI', category: 'education', accuracy: 94.8, detections: 4560, isNew: true },
  { id: 'exam-proctoring', name: 'مراقبة الامتحانات Exam Proctoring AI', category: 'education', accuracy: 96.5, detections: 2340, isNew: true },
];

const detectionCategories = [
  { id: 'behavior_analysis', name: 'تحليل لغة الجسد', icon: Users, color: 'pink', isNew: true },
  { id: 'intent_detection', name: 'كشف النوايا', icon: Brain, color: 'violet', isNew: true },
  { id: 'threat_detection', name: 'كشف التهديدات المتقدم', icon: Shield, color: 'red', isNew: true },
  { id: 'low_light', name: 'الإضاءة المنخفضة', icon: Eye, color: 'indigo', isNew: true },
  { id: 'complex_env', name: 'البيئات المعقدة', icon: Wind, color: 'slate', isNew: true },
  { id: 'people_analytics', name: 'تحليلات الأفراد', icon: Users, color: 'purple' },
  { id: 'vehicle_analytics', name: 'تحليلات المركبات', icon: Car, color: 'amber' },
  { id: 'security', name: 'الأمن', icon: Shield, color: 'orange' },
  { id: 'crowd', name: 'تحليلات الحشود', icon: Users, color: 'cyan' },
  { id: 'safety', name: 'السلامة', icon: AlertTriangle, color: 'green' },
  { id: 'retail', name: 'التجارة', icon: ShoppingBag, color: 'rose' },
  { id: 'environment', name: 'البيئة', icon: Flame, color: 'blue' },
  { id: 'traffic', name: 'المرور', icon: Car, color: 'yellow' },
  { id: 'medical', name: 'الطبي', icon: Heart, color: 'red', isNew: true },
  { id: 'industrial', name: 'الصناعي', icon: Settings, color: 'slate', isNew: true },
  { id: 'agriculture', name: 'الزراعة', icon: Sparkles, color: 'green', isNew: true },
  { id: 'construction', name: 'البناء', icon: Activity, color: 'amber', isNew: true },
  { id: 'analytics', name: 'التحليلات', icon: BarChart3, color: 'purple', isNew: true },
  { id: 'tracking', name: 'التتبع', icon: Target, color: 'cyan', isNew: true },
  { id: 'biometric', name: 'البيومتري', icon: Eye, color: 'pink', isNew: true },
  { id: 'document', name: 'المستندات', icon: FileText, color: 'blue', isNew: true },
  { id: 'sports', name: 'الرياضة', icon: Zap, color: 'green', isNew: true },
  { id: 'wildlife', name: 'الحياة البرية', icon: Heart, color: 'emerald', isNew: true },
  { id: 'food', name: 'الأغذية', icon: ShoppingBag, color: 'orange', isNew: true },
  { id: 'smart_city', name: 'المدينة الذكية', icon: Brain, color: 'indigo', isNew: true },
  { id: 'education', name: 'التعليم', icon: Users, color: 'violet', isNew: true },
];

const CHART_COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];

const detectionTrendData = [
  { hour: '00:00', detections: 120, accuracy: 94 },
  { hour: '04:00', detections: 85, accuracy: 95 },
  { hour: '08:00', detections: 340, accuracy: 93 },
  { hour: '12:00', detections: 520, accuracy: 96 },
  { hour: '16:00', detections: 480, accuracy: 94 },
  { hour: '20:00', detections: 280, accuracy: 95 },
];

export default function AIVisionHub() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('models');
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [expandedModel, setExpandedModel] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('ai_vision_onboarded'));

  const { data: aiVisionModels = [] } = useQuery({
    queryKey: ['aiVisionModels'],
    queryFn: () => base44.entities.AIVisionModel.list('-accuracy', 100),
    initialData: []
  });

  const { data: detections = [] } = useQuery({
    queryKey: ['aiDetections'],
    queryFn: () => base44.entities.AIDetection.list('-created_date', 50),
    initialData: []
  });

  const baseModels = aiModels.length > 0 ? aiModels : aiModels;
  
  const filteredModels = baseModels.filter(m => {
    if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
    if (searchQuery && !m.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (showNewOnly && !m.isNew) return false;
    return true;
  });

  const stats = {
    totalModels: baseModels.length,
    avgAccuracy: baseModels.reduce((s, m) => s + (m.accuracy || 0), 0) / baseModels.length || 0,
    totalDetections: baseModels.reduce((s, m) => s + (m.detections || 0), 0),
    activeModels: baseModels.filter(m => m.accuracy >= 90).length,
    newModels: baseModels.filter(m => m.isNew).length
  };

  const categoryDistribution = detectionCategories.map(cat => ({
    name: cat.name,
    value: baseModels.filter(m => m.category === cat.id).length,
    color: cat.color
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0d1225] to-[#0a0e1a] p-4 lg:p-6" dir="rtl">
      {/* Smart Onboarding */}
      {showOnboarding && (
        <AISmartOnboarding onComplete={() => {
          setShowOnboarding(false);
          localStorage.setItem('ai_vision_onboarded', 'true');
        }} />
      )}
      {/* Enhanced Header with Gradient */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-purple-500/10 border border-purple-500/20 p-6"
      >
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(34, 211, 238, 0.3)',
                  '0 0 40px rgba(168, 85, 247, 0.5)',
                  '0 0 20px rgba(34, 211, 238, 0.3)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-purple-500/30 backdrop-blur-sm"
            >
              <Eye className="w-10 h-10 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
                مركز AI Vision المتقدم
                <Badge className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/30 animate-pulse">
                  <Sparkles className="w-3 h-3 ml-1" />
                  v3.0 Pro
                </Badge>
              </h1>
              <p className="text-slate-300 mt-2 text-lg">{stats.totalModels}+ نموذج ذكاء اصطناعي للرؤية الحاسوبية المتقدمة</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                  <CheckCircle className="w-3 h-3 ml-1" />
                  {stats.activeModels} نموذج نشط
                </Badge>
                <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  دقة {stats.avgAccuracy.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-400">
              <RefreshCw className="w-4 h-4 ml-1" />
              تحديث البيانات
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
              <Settings className="w-4 h-4 ml-1" />
              إعدادات متقدمة
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Stats with Gradients */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'نموذج AI', value: stats.totalModels, icon: Brain, gradient: 'from-cyan-500/20 to-blue-500/20', border: 'cyan', glow: 'cyan' },
          { label: 'دقة متوسطة', value: `${stats.avgAccuracy.toFixed(1)}%`, icon: Target, gradient: 'from-green-500/20 to-emerald-500/20', border: 'green', glow: 'green' },
          { label: 'كشف اليوم', value: stats.totalDetections.toLocaleString(), icon: Activity, gradient: 'from-purple-500/20 to-pink-500/20', border: 'purple', glow: 'purple' },
          { label: 'نموذج نشط', value: stats.activeModels, icon: Zap, gradient: 'from-amber-500/20 to-orange-500/20', border: 'amber', glow: 'amber' },
          { label: 'نماذج جديدة', value: stats.newModels, icon: Sparkles, gradient: 'from-pink-500/20 to-rose-500/20', border: 'pink', glow: 'pink' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card className={`bg-gradient-to-br ${stat.gradient} border-${stat.border}-500/40 hover:border-${stat.border}-400 transition-all cursor-pointer backdrop-blur-sm relative overflow-hidden group`}>
              <div className={`absolute inset-0 bg-${stat.glow}-500/0 group-hover:bg-${stat.glow}-500/5 transition-all`} />
              <CardContent className="p-4 text-center relative">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className={`absolute -top-10 -right-10 w-20 h-20 rounded-full bg-${stat.glow}-500/10 blur-2xl`}
                />
                <stat.icon className={`w-7 h-7 text-${stat.border}-400 mx-auto mb-2 drop-shadow-glow`} />
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className={`text-${stat.border}-400 text-xs font-medium`}>{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Enhanced Navigation Tabs with Scroll */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative group"
        >
          {/* Scroll Indicators */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0a0e1a] to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0a0e1a] to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <ScrollArea className="w-full" dir="rtl">
            <TabsList className="inline-flex w-max bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 p-2 rounded-2xl shadow-2xl shadow-purple-500/10 gap-1">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="models" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/40 data-[state=active]:to-cyan-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <Boxes className="w-4 h-4 ml-2" />
                  <span className="font-semibold">النماذج</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/40 data-[state=active]:to-purple-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <BarChart3 className="w-4 h-4 ml-2" />
                  <span className="font-semibold">التحليلات</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="live" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/40 data-[state=active]:to-emerald-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <MonitorDot className="w-4 h-4 ml-2 animate-pulse" />
                  <span className="font-semibold">مباشر</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="realtime-monitor" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/40 data-[state=active]:to-teal-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <Gauge className="w-4 h-4 ml-2" />
                  <span className="font-semibold">المراقبة الفورية</span>
                  <Badge className="mr-2 bg-green-500/30 text-green-400 text-[9px] px-1.5 animate-pulse">Live</Badge>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="alerts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500/40 data-[state=active]:to-rose-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-red-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <Bell className="w-4 h-4 ml-2" />
                  <span className="font-semibold">التنبيهات</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="anomaly-detection" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/40 data-[state=active]:to-red-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <Radar className="w-4 h-4 ml-2" />
                  <span className="font-semibold">كشف الشذوذات</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="ml-training" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/40 data-[state=active]:to-pink-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <Brain className="w-4 h-4 ml-2" />
                  <span className="font-semibold">تدريب ML</span>
                  <Badge className="mr-2 bg-purple-500/30 text-purple-400 text-[9px] px-1.5">Pro</Badge>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="failure-prediction" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/40 data-[state=active]:to-orange-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <AlertTriangle className="w-4 h-4 ml-2" />
                  <span className="font-semibold">توقع الفشل</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="auto-response" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/40 data-[state=active]:to-blue-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <Zap className="w-4 h-4 ml-2" />
                  <span className="font-semibold">استجابة تلقائية</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="predictive" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/40 data-[state=active]:to-violet-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <BrainCircuit className="w-4 h-4 ml-2" />
                  <span className="font-semibold">التحليل التنبؤي</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/40 data-[state=active]:to-sky-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <FileText className="w-4 h-4 ml-2" />
                  <span className="font-semibold">التقارير</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="ai-reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/40 data-[state=active]:to-purple-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <Sparkles className="w-4 h-4 ml-2" />
                  <span className="font-semibold">التقارير AI</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="management" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500/40 data-[state=active]:to-rose-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-pink-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <Settings className="w-4 h-4 ml-2" />
                  <span className="font-semibold">الإدارة</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="pipeline" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/40 data-[state=active]:to-green-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <Network className="w-4 h-4 ml-2" />
                  <span className="font-semibold">البيانات</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="threats" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500/40 data-[state=active]:to-rose-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-red-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <ShieldCheck className="w-4 h-4 ml-2" />
                  <span className="font-semibold">التهديدات</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="governance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/40 data-[state=active]:to-yellow-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <Gavel className="w-4 h-4 ml-2" />
                  <span className="font-semibold">الحوكمة</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="deployment" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/40 data-[state=active]:to-blue-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <Rocket className="w-4 h-4 ml-2" />
                  <span className="font-semibold">النشر</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="marketplace" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500/40 data-[state=active]:to-fuchsia-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-pink-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <Store className="w-4 h-4 ml-2" />
                  <span className="font-semibold">السوق</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="mlops" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500/40 data-[state=active]:to-cyan-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-sky-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <Workflow className="w-4 h-4 ml-2" />
                  <span className="font-semibold">MLOps</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="adv-mlops" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500/40 data-[state=active]:to-cyan-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <Cpu className="w-4 h-4 ml-2" />
                  <span className="font-semibold">MLOps+</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="insights" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500/40 data-[state=active]:to-emerald-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <Telescope className="w-4 h-4 ml-2" />
                  <span className="font-semibold">رؤى الأداء</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="collaboration" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/40 data-[state=active]:to-indigo-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <Users className="w-4 h-4 ml-2" />
                  <span className="font-semibold">التعاون</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="governance-dashboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/40 data-[state=active]:to-purple-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <Scale className="w-4 h-4 ml-2" />
                  <span className="font-semibold">لوحة الحوكمة</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="adv-governance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-500/40 data-[state=active]:to-pink-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-fuchsia-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <Scale className="w-4 h-4 ml-2" />
                  <span className="font-semibold">حوكمة+</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="custom-dashboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500/40 data-[state=active]:to-pink-600/40 data-[state=active]:shadow-lg data-[state=active]:shadow-rose-500/20 rounded-xl px-4 py-2.5 transition-all duration-300">
                  <LayoutGrid className="w-4 h-4 ml-2" />
                  <span className="font-semibold">لوحة مخصصة</span>
                </TabsTrigger>
              </motion.div>
            </TabsList>
          </ScrollArea>
        </motion.div>

        {/* Enhanced Analytics Tab */}
        <TabsContent value="analytics" className="mt-6 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border-cyan-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  اتجاه الكشف اليوم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={detectionTrendData}>
                      <defs>
                        <linearGradient id="detectionGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'linear-gradient(135deg, rgba(15, 22, 41, 0.95) 0%, rgba(15, 22, 41, 0.9) 100%)', 
                          border: '1px solid rgba(34, 211, 238, 0.3)', 
                          borderRadius: 12,
                          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                        }} 
                      />
                      <Area type="monotone" dataKey="detections" stroke="#22d3ee" fill="url(#detectionGradient)" strokeWidth={2} name="الكشوفات" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white font-semibold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  توزيع الفئات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistribution.filter(c => c.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {categoryDistribution.filter(c => c.value > 0).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                            stroke={CHART_COLORS[index % CHART_COLORS.length]}
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(15, 22, 41, 0.95)', 
                          border: '1px solid rgba(168, 85, 247, 0.3)', 
                          borderRadius: 12 
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          </motion.div>
        </TabsContent>

        {/* Enhanced Live Tab */}
        <TabsContent value="live" className="mt-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
          <Card className="bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-green-500/10 backdrop-blur-sm border-green-500/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.02]" />
            <CardContent className="p-8 text-center relative">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 20px rgba(34, 197, 94, 0.3)',
                    '0 0 40px rgba(34, 197, 94, 0.6)',
                    '0 0 20px rgba(34, 197, 94, 0.3)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block p-4 rounded-full bg-green-500/20 mb-6"
              >
                <Activity className="w-16 h-16 text-green-400" />
              </motion.div>
              <h3 className="text-white font-bold text-2xl mb-3 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                البث المباشر للكشوفات AI
              </h3>
              <p className="text-slate-300 text-lg mb-6 max-w-md mx-auto">
                مراقبة فورية لجميع الكشوفات من {stats.activeModels} نموذج نشط عبر {baseModels.filter(m => m.detections > 0).length} كاميرا
              </p>
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30 px-8 py-6 text-lg">
                <Play className="w-5 h-5 ml-2" />
                بدء البث المباشر
              </Button>
            </CardContent>
          </Card>
          </motion.div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="mt-4">
          <AIVisionAlerts />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-4">
          <AIVisionReporting />
        </TabsContent>

        {/* Model Management Tab */}
        <TabsContent value="management" className="mt-4">
          <AIModelManagement />
        </TabsContent>

        {/* Data Pipeline Tab */}
        <TabsContent value="pipeline" className="mt-4">
          <AIDataPipelineOptimizer />
        </TabsContent>

        {/* Governance Tab */}
        <TabsContent value="governance" className="mt-4">
          <AIGovernanceModule />
        </TabsContent>

        {/* Deployment Lifecycle Tab */}
        <TabsContent value="deployment" className="mt-4">
          <AIDeploymentLifecycle currentVersion="2.1.0" />
        </TabsContent>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="mt-4">
          <AIModelMarketplace />
        </TabsContent>

        {/* Governance Dashboard Tab */}
        <TabsContent value="governance-dashboard" className="mt-4">
          <AIGovernanceDashboard />
        </TabsContent>

        {/* Threat Intelligence Tab */}
        <TabsContent value="threats" className="mt-4">
          <AIThreatIntelligence />
        </TabsContent>

        {/* MLOps Workflows Tab */}
        <TabsContent value="mlops" className="mt-4">
          <AIMLOpsWorkflows />
        </TabsContent>

        {/* Performance Insights Tab */}
        <TabsContent value="insights" className="mt-4">
          <AIModelPerformanceInsights />
        </TabsContent>

        {/* Collaboration Tab */}
        <TabsContent value="collaboration" className="mt-4">
          <AIRealTimeCollaboration />
        </TabsContent>

        {/* Advanced MLOps Tab */}
        <TabsContent value="adv-mlops" className="mt-4">
          <AIAdvancedMLOps />
        </TabsContent>

        {/* Advanced Governance Tab */}
        <TabsContent value="adv-governance" className="mt-4">
          <AIAdvancedGovernance />
        </TabsContent>

        {/* Anomaly Detection Tab */}
        <TabsContent value="anomaly-detection" className="mt-4">
          <AIProactiveAnomalyDetector />
        </TabsContent>

        {/* ML Training Tab */}
        <TabsContent value="ml-training" className="mt-4">
          <AIAdvancedAnomalyTraining />
        </TabsContent>

        {/* AI Reports Tab */}
        <TabsContent value="ai-reports" className="mt-4">
          <AIAutomatedReportGenerator />
        </TabsContent>

        {/* Custom Dashboard Tab */}
        <TabsContent value="custom-dashboard" className="mt-4">
          <AICustomizableDashboard />
        </TabsContent>

        {/* Predictive Analytics Tab */}
        <TabsContent value="predictive" className="mt-4">
          <AIPredictiveAnalytics />
        </TabsContent>

        {/* Real-Time Model Monitor Tab */}
        <TabsContent value="realtime-monitor" className="mt-4">
          <AIRealTimeModelMonitor />
        </TabsContent>

        {/* Failure Prediction Tab */}
        <TabsContent value="failure-prediction" className="mt-4">
          <AIModelFailurePrediction />
        </TabsContent>

        {/* Auto Response Tab */}
        <TabsContent value="auto-response" className="mt-4">
          <AIAutoResponseSystem />
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="mt-4">

      {/* Enhanced Categories - Scrollable with Improved Design */}
      <div className="mb-6">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Filter className="w-4 h-4 text-purple-400" />
          تصنيف النماذج
        </h3>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 pb-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card 
                className={`cursor-pointer flex-shrink-0 transition-all backdrop-blur-sm ${
                  selectedCategory === 'all' 
                    ? 'border-cyan-500 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 shadow-lg shadow-cyan-500/20' 
                    : 'border-slate-700/50 bg-slate-800/40 hover:border-cyan-500/50 hover:bg-slate-800/60'
                }`} 
                onClick={() => setSelectedCategory('all')}
              >
                <CardContent className="p-4 text-center min-w-[110px]">
                  <Eye className={`w-6 h-6 mx-auto mb-2 ${selectedCategory === 'all' ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <p className="text-white text-sm font-semibold">الكل</p>
                  <Badge className="mt-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">{baseModels.length}</Badge>
                </CardContent>
              </Card>
            </motion.div>
            {detectionCategories.map(cat => {
              const count = baseModels.filter(m => m.category === cat.id).length;
              if (count === 0) return null;
              return (
                <motion.div key={cat.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Card 
                    className={`cursor-pointer flex-shrink-0 transition-all backdrop-blur-sm ${
                      selectedCategory === cat.id 
                        ? `border-${cat.color}-500 bg-gradient-to-br from-${cat.color}-500/20 to-${cat.color}-600/20 shadow-lg shadow-${cat.color}-500/20` 
                        : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/60'
                    }`} 
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <CardContent className="p-4 text-center min-w-[110px]">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <cat.icon className={`w-6 h-6 ${selectedCategory === cat.id ? `text-${cat.color}-400` : 'text-slate-400'}`} />
                        {cat.isNew && (
                          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                            <Badge className="bg-pink-500/20 text-pink-400 text-[8px] px-1 border border-pink-500/30">جديد</Badge>
                          </motion.div>
                        )}
                      </div>
                      <p className="text-white text-sm font-medium">{cat.name}</p>
                      <Badge className={`mt-1 bg-${cat.color}-500/20 text-${cat.color}-400 border border-${cat.color}-500/30`}>{count}</Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Enhanced Search & Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في 200+ نموذج ذكاء اصطناعي..."
            className="bg-gradient-to-r from-slate-800/80 to-slate-800/60 backdrop-blur-sm border-slate-700/50 text-white pr-10 h-11 focus:border-cyan-500/50 transition-all"
          />
        </div>
        <motion.div whileHover={{ scale: 1.02 }}>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl border border-pink-500/30">
            <Switch checked={showNewOnly} onCheckedChange={setShowNewOnly} />
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span className="text-pink-400 text-sm font-medium">النماذج الجديدة فقط</span>
            {showNewOnly && <Badge className="bg-pink-500/20 text-pink-400">{filteredModels.length}</Badge>}
          </div>
        </motion.div>
        <div className="flex border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm bg-slate-800/40">
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'ghost'} 
            size="sm" 
            className={`rounded-none h-11 ${viewMode === 'grid' ? 'bg-gradient-to-r from-purple-600 to-purple-700' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4 ml-1" />
            شبكة
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'ghost'} 
            size="sm" 
            className={`rounded-none h-11 ${viewMode === 'list' ? 'bg-gradient-to-r from-purple-600 to-purple-700' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4 ml-1" />
            قائمة
          </Button>
        </div>
      </div>

      {/* Enhanced Results Count with Quick Stats */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-slate-800/40 to-slate-800/20 backdrop-blur-sm rounded-xl border border-slate-700/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-medium">عرض {filteredModels.length} من {baseModels.length} نموذج</span>
          </div>
          {selectedCategory !== 'all' && (
            <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">
              الفئة: {detectionCategories.find(c => c.id === selectedCategory)?.name}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500/20 text-green-400">
            <TrendingUp className="w-3 h-3 ml-1" />
            {filteredModels.filter(m => m.accuracy >= 95).length} عالي الدقة
          </Badge>
        </div>
      </div>

      {/* Models Grid/List */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
          >
            {filteredModels.map((model, i) => {
              const category = detectionCategories.find(c => c.id === model.category);
              const isExpanded = expandedModel === model.id;
              return (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card 
                      className={`backdrop-blur-sm border-slate-700/50 hover:border-${category?.color || 'cyan'}-500/60 transition-all cursor-pointer relative overflow-hidden group ${
                        isExpanded ? `bg-gradient-to-br from-${category?.color || 'cyan'}-500/15 to-slate-800/40` : 'bg-slate-800/40'
                      }`}
                      onClick={() => setExpandedModel(isExpanded ? null : model.id)}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br from-${category?.color || 'cyan'}-500/0 to-${category?.color || 'cyan'}-500/5 opacity-0 group-hover:opacity-100 transition-opacity`} />
                      <CardContent className="p-4 relative">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {category && (
                              <div className={`p-1.5 rounded-lg bg-${category.color}-500/20`}>
                                <category.icon className={`w-5 h-5 text-${category.color}-400`} />
                              </div>
                            )}
                            <span className="text-white font-medium text-sm truncate">{model.name}</span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {model.isNew && (
                              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                                <Badge className="bg-pink-500/20 text-pink-400 text-[9px] px-1.5 border border-pink-500/40">
                                  <Sparkles className="w-2 h-2 ml-0.5" />
                                  جديد
                                </Badge>
                              </motion.div>
                            )}
                            <Badge className={`text-[10px] font-bold ${
                              model.accuracy >= 95 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                              model.accuracy >= 90 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                              'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {model.accuracy}%
                            </Badge>
                          </div>
                        </div>
                        <Progress value={model.accuracy} className="h-1.5 mb-3" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Activity className="w-3 h-3 text-purple-400" />
                            <span className="text-slate-400 text-xs">{model.detections?.toLocaleString() || 0} كشف</span>
                          </div>
                          <Badge variant="outline" className={`text-[10px] border-${category?.color || 'slate'}-500/30 text-${category?.color || 'slate'}-400`}>
                            {category?.name}
                          </Badge>
                        </div>

                        {/* Expanded Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-3 pt-3 border-t border-slate-700"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-400 text-xs">الحالة</span>
                                  <Badge className="bg-green-500/20 text-green-400 text-[10px]">
                                    <CheckCircle className="w-3 h-3 ml-1" />
                                    نشط
                                  </Badge>
                                </div>
                                <Button size="sm" className="w-full bg-cyan-600 hover:bg-cyan-700 h-7 text-xs">
                                  <Play className="w-3 h-3 ml-1" />
                                  اختبار النموذج
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        </CardContent>
                        </Card>
                        </motion.div>
                        </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {filteredModels.map((model, i) => {
              const category = detectionCategories.find(c => c.id === model.category);
              return (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <motion.div whileHover={{ x: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className={`backdrop-blur-sm border-slate-700/50 hover:border-${category?.color || 'cyan'}-500/60 transition-all relative overflow-hidden group bg-gradient-to-r from-slate-800/40 to-slate-800/20`}>
                      <div className={`absolute inset-0 bg-gradient-to-r from-${category?.color || 'cyan'}-500/0 to-${category?.color || 'cyan'}-500/5 opacity-0 group-hover:opacity-100 transition-opacity`} />
                      <CardContent className="p-4 flex items-center gap-4 relative">
                        {category && (
                          <div className={`p-2 rounded-xl bg-${category.color}-500/20 border border-${category.color}-500/30`}>
                            <category.icon className={`w-6 h-6 text-${category.color}-400`} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-semibold text-base">{model.name}</span>
                            {model.isNew && (
                              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                                <Badge className="bg-pink-500/20 text-pink-400 text-[9px] border border-pink-500/40">
                                  <Sparkles className="w-2 h-2 ml-0.5" />
                                  جديد
                                </Badge>
                              </motion.div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-[10px] border-${category?.color || 'slate'}-500/30 text-${category?.color || 'slate'}-400`}>
                              {category?.name}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-purple-400 font-bold text-lg">{model.detections?.toLocaleString() || 0}</p>
                            <p className="text-slate-500 text-[10px]">كشف اليوم</p>
                          </div>
                          <div className="text-center">
                            <p className={`text-2xl font-bold ${
                              model.accuracy >= 95 ? 'text-green-400' : 
                              model.accuracy >= 90 ? 'text-amber-400' : 
                              'text-red-400'
                            }`}>{model.accuracy}%</p>
                            <p className="text-slate-500 text-[10px]">الدقة</p>
                          </div>
                          <Badge className={`px-3 py-1 ${
                            model.accuracy >= 95 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                            model.accuracy >= 90 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                            'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {model.accuracy >= 95 ? '⭐ ممتاز' : model.accuracy >= 90 ? '✓ جيد' : '! عادي'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}