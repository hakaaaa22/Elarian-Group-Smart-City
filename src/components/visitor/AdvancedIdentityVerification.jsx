import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  ScanLine, Camera, Car, User, CheckCircle, XCircle, AlertTriangle,
  Upload, RefreshCw, Eye, Shield, Fingerprint, History, Link2,
  Image, FileText, Zap, Clock, Database
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const verificationHistory = [
  { id: 1, type: 'ocr', visitorName: 'أحمد محمد', result: 'success', confidence: 98.5, timestamp: '2025-01-15 10:30' },
  { id: 2, type: 'face', visitorName: 'سارة خالد', result: 'success', confidence: 95.2, timestamp: '2025-01-15 10:25' },
  { id: 3, type: 'lpr', visitorName: 'محمد علي', result: 'success', confidence: 99.1, timestamp: '2025-01-15 10:20' },
  { id: 4, type: 'face', visitorName: 'فاطمة أحمد', result: 'failed', confidence: 45.3, timestamp: '2025-01-15 10:15' },
  { id: 5, type: 'ocr', visitorName: 'خالد سعيد', result: 'success', confidence: 97.8, timestamp: '2025-01-15 10:10' },
];

const linkedCameras = [
  { id: 'cam1', name: 'كاميرا البوابة الرئيسية', zone: 'المدخل', status: 'active' },
  { id: 'cam2', name: 'كاميرا الاستقبال', zone: 'اللوبي', status: 'active' },
  { id: 'cam3', name: 'كاميرا موقف الزوار', zone: 'المواقف', status: 'active' },
  { id: 'cam4', name: 'كاميرا المصعد A', zone: 'الطابق 1', status: 'maintenance' },
];

export default function AdvancedIdentityVerification() {
  const [activeTab, setActiveTab] = useState('ocr');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [history, setHistory] = useState(verificationHistory);

  const ocrMutation = useMutation({
    mutationFn: async (imageUrl) => {
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: imageUrl,
        json_schema: {
          type: 'object',
          properties: {
            full_name: { type: 'string' },
            id_number: { type: 'string' },
            nationality: { type: 'string' },
            birth_date: { type: 'string' },
            expiry_date: { type: 'string' },
            gender: { type: 'string' }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setVerificationResult({
        type: 'ocr',
        status: 'success',
        confidence: 97.5,
        data: data.output
      });
      toast.success('تم استخراج بيانات الهوية بنجاح');
    },
    onError: () => {
      setVerificationResult({
        type: 'ocr',
        status: 'failed',
        confidence: 0,
        data: null
      });
      toast.error('فشل في قراءة بيانات الهوية');
    }
  });

  const faceRecognitionMutation = useMutation({
    mutationFn: async (imageUrl) => {
      // Simulate face recognition
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        matched: true,
        confidence: 95.8,
        visitor: {
          name: 'أحمد محمد علي',
          lastVisit: '2025-01-10',
          totalVisits: 5
        }
      };
    },
    onSuccess: (data) => {
      setVerificationResult({
        type: 'face',
        status: data.matched ? 'success' : 'failed',
        confidence: data.confidence,
        data: data.visitor
      });
      toast.success('تم التعرف على الوجه بنجاح');
    }
  });

  const lprMutation = useMutation({
    mutationFn: async (imageUrl) => {
      // Simulate LPR
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        plate: 'أ ب ج 1234',
        confidence: 99.2,
        registered: true,
        owner: 'أحمد محمد علي',
        vehicleType: 'سيدان',
        color: 'أبيض'
      };
    },
    onSuccess: (data) => {
      setVerificationResult({
        type: 'lpr',
        status: 'success',
        confidence: data.confidence,
        data: data
      });
      toast.success('تم قراءة لوحة المركبة بنجاح');
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedImage(file_url);
      setVerificationResult(null);
    } catch (err) {
      toast.error('فشل في رفع الصورة');
    }
  };

  const runVerification = () => {
    if (!uploadedImage) {
      toast.error('الرجاء رفع صورة أولاً');
      return;
    }

    switch (activeTab) {
      case 'ocr':
        ocrMutation.mutate(uploadedImage);
        break;
      case 'face':
        faceRecognitionMutation.mutate(uploadedImage);
        break;
      case 'lpr':
        lprMutation.mutate(uploadedImage);
        break;
    }
  };

  const isLoading = ocrMutation.isPending || faceRecognitionMutation.isPending || lprMutation.isPending;

  const stats = {
    total: history.length,
    success: history.filter(h => h.result === 'success').length,
    failed: history.filter(h => h.result === 'failed').length,
    avgConfidence: Math.round(history.reduce((acc, h) => acc + h.confidence, 0) / history.length)
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <ScanLine className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-purple-400 text-sm">عمليات التحقق</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.success}</p>
              <p className="text-green-400 text-sm">ناجحة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.failed}</p>
              <p className="text-red-400 text-sm">فاشلة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.avgConfidence}%</p>
              <p className="text-cyan-400 text-sm">متوسط الثقة</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Verification Panel */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              التحقق من الهوية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-slate-900/50 border border-slate-700 w-full">
                <TabsTrigger value="ocr" className="flex-1 data-[state=active]:bg-purple-500/20">
                  <FileText className="w-4 h-4 ml-1" />
                  OCR الهوية
                </TabsTrigger>
                <TabsTrigger value="face" className="flex-1 data-[state=active]:bg-cyan-500/20">
                  <User className="w-4 h-4 ml-1" />
                  التعرف على الوجه
                </TabsTrigger>
                <TabsTrigger value="lpr" className="flex-1 data-[state=active]:bg-green-500/20">
                  <Car className="w-4 h-4 ml-1" />
                  قراءة اللوحات
                </TabsTrigger>
              </TabsList>

              <div className="mt-4 space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center">
                  {uploadedImage ? (
                    <div className="space-y-3">
                      <img src={uploadedImage} alt="Uploaded" className="max-h-48 mx-auto rounded-lg" />
                      <Button variant="ghost" size="sm" onClick={() => setUploadedImage(null)}>
                        <RefreshCw className="w-4 h-4 ml-1" />
                        تغيير الصورة
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                      <p className="text-slate-400 mb-2">
                        {activeTab === 'ocr' && 'ارفع صورة الهوية'}
                        {activeTab === 'face' && 'ارفع صورة الوجه'}
                        {activeTab === 'lpr' && 'ارفع صورة لوحة المركبة'}
                      </p>
                      <p className="text-slate-500 text-sm">PNG, JPG حتى 10MB</p>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>

                {/* Verify Button */}
                <Button
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                  onClick={runVerification}
                  disabled={!uploadedImage || isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                      جاري التحقق...
                    </>
                  ) : (
                    <>
                      <ScanLine className="w-4 h-4 ml-2" />
                      بدء التحقق
                    </>
                  )}
                </Button>

                {/* Result */}
                {verificationResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${
                      verificationResult.status === 'success' 
                        ? 'bg-green-500/10 border border-green-500/30' 
                        : 'bg-red-500/10 border border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {verificationResult.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                      <span className={`font-bold ${
                        verificationResult.status === 'success' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {verificationResult.status === 'success' ? 'تم التحقق بنجاح' : 'فشل التحقق'}
                      </span>
                      <Badge className="bg-slate-700 text-white mr-auto">
                        {verificationResult.confidence}% ثقة
                      </Badge>
                    </div>

                    {verificationResult.data && (
                      <div className="space-y-2 text-sm">
                        {verificationResult.type === 'ocr' && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-slate-400">الاسم:</span>
                              <span className="text-white">{verificationResult.data.full_name || 'غير متوفر'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">رقم الهوية:</span>
                              <span className="text-white">{verificationResult.data.id_number || 'غير متوفر'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">الجنسية:</span>
                              <span className="text-white">{verificationResult.data.nationality || 'غير متوفر'}</span>
                            </div>
                          </>
                        )}
                        {verificationResult.type === 'face' && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-slate-400">الزائر:</span>
                              <span className="text-white">{verificationResult.data.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">آخر زيارة:</span>
                              <span className="text-white">{verificationResult.data.lastVisit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">إجمالي الزيارات:</span>
                              <span className="text-white">{verificationResult.data.totalVisits}</span>
                            </div>
                          </>
                        )}
                        {verificationResult.type === 'lpr' && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-slate-400">اللوحة:</span>
                              <span className="text-white font-mono">{verificationResult.data.plate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">المالك:</span>
                              <span className="text-white">{verificationResult.data.owner}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">النوع:</span>
                              <span className="text-white">{verificationResult.data.vehicleType} - {verificationResult.data.color}</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Linked Cameras & History */}
        <div className="space-y-4">
          {/* Linked Cameras */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Camera className="w-4 h-4 text-pink-400" />
                الكاميرات المرتبطة (Face Recognition)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {linkedCameras.map(cam => (
                <div key={cam.id} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Camera className={`w-4 h-4 ${cam.status === 'active' ? 'text-green-400' : 'text-amber-400'}`} />
                    <div>
                      <p className="text-white text-sm">{cam.name}</p>
                      <p className="text-slate-500 text-xs">{cam.zone}</p>
                    </div>
                  </div>
                  <Badge className={cam.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                    {cam.status === 'active' ? 'نشط' : 'صيانة'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Verification History */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                سجل عمليات التحقق
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
              {history.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {item.type === 'ocr' && <FileText className="w-4 h-4 text-purple-400" />}
                    {item.type === 'face' && <User className="w-4 h-4 text-cyan-400" />}
                    {item.type === 'lpr' && <Car className="w-4 h-4 text-green-400" />}
                    <div>
                      <p className="text-white text-sm">{item.visitorName}</p>
                      <p className="text-slate-500 text-xs">{item.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">{item.confidence}%</span>
                    {item.result === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}