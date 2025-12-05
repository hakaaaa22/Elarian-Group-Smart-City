import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import {
  Camera, CreditCard, Car, User, Check, X, Upload, Scan, Eye,
  Shield, AlertTriangle, CheckCircle, Loader2, RefreshCw, History,
  Fingerprint, Brain, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const mockVerificationHistory = [
  { id: 1, visitor: 'أحمد محمد', type: 'id_ocr', result: 'success', confidence: 98, timestamp: '2024-12-04 09:45', details: 'تطابق الهوية' },
  { id: 2, visitor: 'سارة أحمد', type: 'face_recognition', result: 'success', confidence: 95, timestamp: '2024-12-04 09:30', details: 'تطابق الوجه' },
  { id: 3, visitor: 'محمد علي', type: 'lpr', result: 'success', confidence: 99, timestamp: '2024-12-04 09:15', details: 'تطابق اللوحة ABC 1234' },
  { id: 4, visitor: 'خالد العلي', type: 'face_recognition', result: 'failed', confidence: 45, timestamp: '2024-12-04 09:00', details: 'عدم تطابق - تحقق يدوي مطلوب' },
];

export default function IdentityVerification() {
  const [activeTab, setActiveTab] = useState('verify');
  const [verificationHistory, setVerificationHistory] = useState(mockVerificationHistory);
  const [currentVerification, setCurrentVerification] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // OCR Mutation
  const ocrMutation = useMutation({
    mutationFn: async (imageData) => {
      // محاكاة OCR
      await new Promise(r => setTimeout(r, 2000));
      return {
        success: true,
        data: {
          name: 'أحمد محمد العلي',
          id_number: '1234567890',
          nationality: 'سعودي',
          birth_date: '1990-05-15',
          expiry_date: '2028-03-20',
          confidence: 96
        }
      };
    },
    onSuccess: (result) => {
      setVerificationResult(result);
      toast.success('تم استخراج بيانات الهوية بنجاح');
      addToHistory('id_ocr', 'success', result.data.confidence, 'استخراج بيانات الهوية');
    }
  });

  // Face Recognition Mutation
  const faceRecognitionMutation = useMutation({
    mutationFn: async (imageData) => {
      await new Promise(r => setTimeout(r, 2500));
      return {
        success: true,
        match: true,
        confidence: 94,
        matched_visitor: 'أحمد محمد',
        permit_number: 'P-2024-001'
      };
    },
    onSuccess: (result) => {
      setVerificationResult(result);
      if (result.match) {
        toast.success(`تم التعرف على الزائر: ${result.matched_visitor}`);
        addToHistory('face_recognition', 'success', result.confidence, `تطابق مع ${result.matched_visitor}`);
      } else {
        toast.error('لم يتم التعرف على الوجه');
        addToHistory('face_recognition', 'failed', result.confidence, 'عدم تطابق');
      }
    }
  });

  // LPR Mutation
  const lprMutation = useMutation({
    mutationFn: async (imageData) => {
      await new Promise(r => setTimeout(r, 1500));
      return {
        success: true,
        plate_number: 'ABC 1234',
        plate_type: 'خاص',
        confidence: 98,
        registered_to: 'شركة البناء المتقدم',
        permit_valid: true
      };
    },
    onSuccess: (result) => {
      setVerificationResult(result);
      toast.success(`تم قراءة اللوحة: ${result.plate_number}`);
      addToHistory('lpr', 'success', result.confidence, `قراءة اللوحة ${result.plate_number}`);
    }
  });

  const addToHistory = (type, result, confidence, details) => {
    const newRecord = {
      id: Date.now(),
      visitor: 'زائر حالي',
      type,
      result,
      confidence,
      timestamp: new Date().toLocaleString('ar-SA'),
      details
    };
    setVerificationHistory([newRecord, ...verificationHistory]);
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setCurrentVerification(type);
      };
      reader.readAsDataURL(file);
    }
  };

  const startVerification = (type) => {
    setIsVerifying(true);
    setVerificationResult(null);
    
    if (type === 'ocr') {
      ocrMutation.mutate(uploadedImage);
    } else if (type === 'face') {
      faceRecognitionMutation.mutate(uploadedImage);
    } else if (type === 'lpr') {
      lprMutation.mutate(uploadedImage);
    }

    setTimeout(() => setIsVerifying(false), 3000);
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'id_ocr': return 'OCR الهوية';
      case 'face_recognition': return 'التعرف على الوجه';
      case 'lpr': return 'قراءة اللوحات';
      default: return type;
    }
  };

  const stats = {
    totalVerifications: verificationHistory.length,
    successRate: Math.round((verificationHistory.filter(v => v.result === 'success').length / verificationHistory.length) * 100),
    avgConfidence: Math.round(verificationHistory.reduce((acc, v) => acc + v.confidence, 0) / verificationHistory.length),
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'عمليات التحقق', value: stats.totalVerifications, color: 'cyan' },
          { label: 'نسبة النجاح', value: `${stats.successRate}%`, color: 'green' },
          { label: 'متوسط الثقة', value: `${stats.avgConfidence}%`, color: 'purple' },
        ].map((stat, i) => (
          <Card key={i} className={`bg-${stat.color}-500/10 border-${stat.color}-500/30`}>
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
              <p className="text-slate-400 text-xs">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="verify" className="data-[state=active]:bg-cyan-500/20">
            <Scan className="w-4 h-4 ml-1" />
            التحقق
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-purple-500/20">
            <History className="w-4 h-4 ml-1" />
            السجل
          </TabsTrigger>
        </TabsList>

        {/* Verification Tab */}
        <TabsContent value="verify" className="mt-4 space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* OCR Card */}
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  OCR الهوية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-slate-400 text-xs">استخراج بيانات الهوية تلقائياً</p>
                <div className="border-2 border-dashed border-cyan-500/30 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="ocr-upload"
                    onChange={(e) => handleImageUpload(e, 'ocr')}
                  />
                  <label htmlFor="ocr-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                    <p className="text-cyan-400 text-sm">رفع صورة الهوية</p>
                  </label>
                </div>
                <Button
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                  disabled={currentVerification !== 'ocr' || ocrMutation.isPending}
                  onClick={() => startVerification('ocr')}
                >
                  {ocrMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Scan className="w-4 h-4 ml-2" />}
                  بدء الاستخراج
                </Button>
              </CardContent>
            </Card>

            {/* Face Recognition Card */}
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Camera className="w-4 h-4 text-purple-400" />
                  التعرف على الوجه
                  <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                    <Brain className="w-3 h-3 ml-1" />
                    AI
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-slate-400 text-xs">مطابقة الوجه مع قاعدة البيانات</p>
                <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="face-upload"
                    onChange={(e) => handleImageUpload(e, 'face')}
                  />
                  <label htmlFor="face-upload" className="cursor-pointer">
                    <Camera className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-purple-400 text-sm">رفع صورة الوجه</p>
                  </label>
                </div>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={currentVerification !== 'face' || faceRecognitionMutation.isPending}
                  onClick={() => startVerification('face')}
                >
                  {faceRecognitionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Fingerprint className="w-4 h-4 ml-2" />}
                  بدء المطابقة
                </Button>
              </CardContent>
            </Card>

            {/* LPR Card */}
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Car className="w-4 h-4 text-amber-400" />
                  قراءة اللوحات (LPR)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-slate-400 text-xs">التعرف على لوحة المركبة</p>
                <div className="border-2 border-dashed border-amber-500/30 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="lpr-upload"
                    onChange={(e) => handleImageUpload(e, 'lpr')}
                  />
                  <label htmlFor="lpr-upload" className="cursor-pointer">
                    <Car className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-amber-400 text-sm">رفع صورة اللوحة</p>
                  </label>
                </div>
                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  disabled={currentVerification !== 'lpr' || lprMutation.isPending}
                  onClick={() => startVerification('lpr')}
                >
                  {lprMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Eye className="w-4 h-4 ml-2" />}
                  بدء القراءة
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Verification Result */}
          {verificationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`${verificationResult.success || verificationResult.match ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    {verificationResult.success || verificationResult.match ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    )}
                    نتيجة التحقق
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {verificationResult.data && (
                      <>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-400 text-xs">الاسم</p>
                          <p className="text-white">{verificationResult.data.name}</p>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-400 text-xs">رقم الهوية</p>
                          <p className="text-white">{verificationResult.data.id_number}</p>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-400 text-xs">الجنسية</p>
                          <p className="text-white">{verificationResult.data.nationality}</p>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-400 text-xs">نسبة الثقة</p>
                          <div className="flex items-center gap-2">
                            <Progress value={verificationResult.data.confidence} className="flex-1 h-2" />
                            <span className="text-green-400 font-bold">{verificationResult.data.confidence}%</span>
                          </div>
                        </div>
                      </>
                    )}
                    {verificationResult.plate_number && (
                      <>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-400 text-xs">رقم اللوحة</p>
                          <p className="text-white text-lg font-bold">{verificationResult.plate_number}</p>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-400 text-xs">مسجلة باسم</p>
                          <p className="text-white">{verificationResult.registered_to}</p>
                        </div>
                      </>
                    )}
                    {verificationResult.matched_visitor && (
                      <>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-400 text-xs">الزائر المطابق</p>
                          <p className="text-white">{verificationResult.matched_visitor}</p>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-400 text-xs">رقم التصريح</p>
                          <p className="text-white">{verificationResult.permit_number}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr className="text-slate-400 text-sm">
                      <th className="p-3 text-right">الزائر</th>
                      <th className="p-3 text-right">نوع التحقق</th>
                      <th className="p-3 text-right">النتيجة</th>
                      <th className="p-3 text-right">نسبة الثقة</th>
                      <th className="p-3 text-right">التفاصيل</th>
                      <th className="p-3 text-right">الوقت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verificationHistory.map((record, i) => (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-t border-slate-700/50 hover:bg-slate-800/30"
                      >
                        <td className="p-3 text-white">{record.visitor}</td>
                        <td className="p-3">
                          <Badge className="bg-slate-700 text-slate-300">{getTypeLabel(record.type)}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge className={record.result === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                            {record.result === 'success' ? <CheckCircle className="w-3 h-3 ml-1" /> : <AlertTriangle className="w-3 h-3 ml-1" />}
                            {record.result === 'success' ? 'نجاح' : 'فشل'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Progress value={record.confidence} className="w-16 h-2" />
                            <span className={`text-sm ${record.confidence > 80 ? 'text-green-400' : record.confidence > 60 ? 'text-amber-400' : 'text-red-400'}`}>
                              {record.confidence}%
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-400 text-sm">{record.details}</td>
                        <td className="p-3 text-slate-500 text-sm">{record.timestamp}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}