import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Shield, AlertTriangle, CheckCircle, XCircle, Loader2,
  User, Car, FileText, Database, RefreshCw, Eye, Flag, Clock,
  Fingerprint, CreditCard, Camera, AlertOctagon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const checkTypes = [
  { id: 'national_id', name: 'التحقق من الهوية الوطنية', icon: CreditCard, source: 'نظام أبشر' },
  { id: 'criminal', name: 'السجل الجنائي', icon: Shield, source: 'قاعدة البيانات الأمنية' },
  { id: 'lpr', name: 'نظام لوحات المركبات', icon: Car, source: 'نظام LPR المركزي' },
  { id: 'blacklist', name: 'القائمة السوداء', icon: AlertOctagon, source: 'القائمة الداخلية' },
  { id: 'face', name: 'التعرف على الوجه', icon: Camera, source: 'نظام Face Recognition' },
];

const mockChecks = [
  {
    id: 1,
    visitor: 'أحمد محمد السالم',
    idNumber: '1234567890',
    plateNumber: 'ABC 1234',
    checkDate: '2025-01-15 10:30',
    status: 'passed',
    checks: {
      national_id: { status: 'passed', message: 'تم التحقق بنجاح', confidence: 100 },
      criminal: { status: 'passed', message: 'لا توجد سوابق', confidence: 100 },
      lpr: { status: 'passed', message: 'المركبة مسجلة باسمه', confidence: 98 },
      blacklist: { status: 'passed', message: 'غير مدرج', confidence: 100 },
      face: { status: 'passed', message: 'تطابق 99%', confidence: 99 },
    },
    flags: []
  },
  {
    id: 2,
    visitor: 'سارة خالد العمري',
    idNumber: '0987654321',
    plateNumber: 'XYZ 5678',
    checkDate: '2025-01-15 09:15',
    status: 'flagged',
    checks: {
      national_id: { status: 'passed', message: 'تم التحقق بنجاح', confidence: 100 },
      criminal: { status: 'passed', message: 'لا توجد سوابق', confidence: 100 },
      lpr: { status: 'warning', message: 'المركبة مسجلة باسم آخر', confidence: 75 },
      blacklist: { status: 'passed', message: 'غير مدرج', confidence: 100 },
      face: { status: 'warning', message: 'تطابق جزئي 78%', confidence: 78 },
    },
    flags: ['تناقض في بيانات المركبة', 'تطابق وجه منخفض']
  },
  {
    id: 3,
    visitor: 'محمد علي الفهد',
    idNumber: '5678901234',
    plateNumber: 'DEF 9012',
    checkDate: '2025-01-15 08:45',
    status: 'failed',
    checks: {
      national_id: { status: 'failed', message: 'رقم الهوية غير صالح', confidence: 0 },
      criminal: { status: 'pending', message: 'لم يتم الفحص', confidence: 0 },
      lpr: { status: 'failed', message: 'اللوحة غير مسجلة', confidence: 0 },
      blacklist: { status: 'warning', message: 'تطابق جزئي مع اسم مشابه', confidence: 65 },
      face: { status: 'pending', message: 'لم يتم الفحص', confidence: 0 },
    },
    flags: ['هوية غير صالحة', 'لوحة غير مسجلة', 'تطابق محتمل مع القائمة السوداء']
  },
];

export default function AutomatedBackgroundCheck() {
  const [checks, setChecks] = useState(mockChecks);
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [searchId, setSearchId] = useState('');

  const getStatusConfig = (status) => {
    const config = {
      passed: { color: 'green', label: 'اجتاز', icon: CheckCircle },
      failed: { color: 'red', label: 'فشل', icon: XCircle },
      warning: { color: 'amber', label: 'تحذير', icon: AlertTriangle },
      pending: { color: 'slate', label: 'معلق', icon: Clock },
      flagged: { color: 'orange', label: 'مُعلّم', icon: Flag },
    };
    return config[status] || config.pending;
  };

  const runCheck = async () => {
    if (!searchId) return toast.error('أدخل رقم الهوية أو رقم اللوحة');
    setIsRunning(true);
    await new Promise(r => setTimeout(r, 3000));
    toast.success('تم إكمال الفحص');
    setIsRunning(false);
  };

  const stats = {
    total: checks.length,
    passed: checks.filter(c => c.status === 'passed').length,
    flagged: checks.filter(c => c.status === 'flagged').length,
    failed: checks.filter(c => c.status === 'failed').length,
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
            <Fingerprint className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">الفحص الآلي للخلفيات</h3>
            <p className="text-slate-500 text-sm">التحقق التلقائي عبر أنظمة الهوية الوطنية وLPR</p>
          </div>
        </div>
      </div>

      {/* Quick Check */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Input
              placeholder="أدخل رقم الهوية أو رقم اللوحة..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="flex-1 bg-slate-900/50 border-slate-700 text-white"
            />
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={runCheck} disabled={isRunning}>
              {isRunning ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Search className="w-4 h-4 ml-2" />}
              بدء الفحص
            </Button>
          </div>
          {isRunning && (
            <div className="mt-4 space-y-2">
              <p className="text-slate-400 text-sm">جاري الفحص...</p>
              <Progress value={65} className="h-2" />
              <div className="flex flex-wrap gap-2">
                {checkTypes.map((type, i) => (
                  <Badge key={type.id} className={i < 3 ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}>
                    {i < 3 ? <CheckCircle className="w-3 h-3 ml-1" /> : <Loader2 className="w-3 h-3 ml-1 animate-spin" />}
                    {type.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Database className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-slate-500 text-sm">إجمالي الفحوصات</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{stats.passed}</p>
              <p className="text-slate-500 text-sm">اجتاز</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Flag className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{stats.flagged}</p>
              <p className="text-slate-500 text-sm">مُعلّم</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
              <p className="text-slate-500 text-sm">فشل</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Check Results */}
      <div className="space-y-3">
        {checks.map(check => {
          const statusConfig = getStatusConfig(check.status);
          const StatusIcon = statusConfig.icon;
          return (
            <motion.div
              key={check.id}
              whileHover={{ scale: 1.01 }}
              className={`p-4 rounded-xl border cursor-pointer transition-all bg-slate-800/30 ${
                check.status === 'failed' ? 'border-red-500/30' :
                check.status === 'flagged' ? 'border-amber-500/30' : 'border-slate-700/50'
              }`}
              onClick={() => setSelectedCheck(check)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className={`bg-${statusConfig.color}-500/20 text-${statusConfig.color}-400`}>
                      {check.visitor.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-white font-bold">{check.visitor}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      <span><CreditCard className="w-3 h-3 inline ml-1" />{check.idNumber}</span>
                      <span><Car className="w-3 h-3 inline ml-1" />{check.plateNumber}</span>
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <Badge className={`bg-${statusConfig.color}-500/20 text-${statusConfig.color}-400`}>
                    <StatusIcon className="w-3 h-3 ml-1" />
                    {statusConfig.label}
                  </Badge>
                  <p className="text-slate-500 text-xs mt-1">{check.checkDate}</p>
                </div>
              </div>

              {/* Check Types Status */}
              <div className="flex gap-2 mt-3 flex-wrap">
                {checkTypes.map(type => {
                  const checkResult = check.checks[type.id];
                  const resultConfig = getStatusConfig(checkResult.status);
                  const ResultIcon = resultConfig.icon;
                  return (
                    <Badge key={type.id} variant="outline" className={`border-${resultConfig.color}-500/50 text-${resultConfig.color}-400`}>
                      <ResultIcon className="w-3 h-3 ml-1" />
                      {type.name.split(' ')[0]}
                    </Badge>
                  );
                })}
              </div>

              {/* Flags */}
              {check.flags.length > 0 && (
                <div className="mt-3 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-red-400 text-sm font-medium mb-1">تنبيهات للمراجعة:</p>
                  <div className="flex flex-wrap gap-1">
                    {check.flags.map((flag, i) => (
                      <Badge key={i} className="bg-red-500/20 text-red-400 text-xs">
                        <AlertTriangle className="w-3 h-3 ml-1" />
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedCheck} onOpenChange={() => setSelectedCheck(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-cyan-400" />
              تفاصيل الفحص - {selectedCheck?.visitor}
            </DialogTitle>
          </DialogHeader>
          {selectedCheck && (
            <div className="space-y-4 mt-4">
              {checkTypes.map(type => {
                const result = selectedCheck.checks[type.id];
                const statusConfig = getStatusConfig(result.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <div key={type.id} className={`p-3 rounded-lg border bg-${statusConfig.color}-500/5 border-${statusConfig.color}-500/30`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <type.icon className={`w-5 h-5 text-${statusConfig.color}-400`} />
                        <div>
                          <p className="text-white font-medium">{type.name}</p>
                          <p className="text-slate-500 text-xs">المصدر: {type.source}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <Badge className={`bg-${statusConfig.color}-500/20 text-${statusConfig.color}-400`}>
                          <StatusIcon className="w-3 h-3 ml-1" />
                          {statusConfig.label}
                        </Badge>
                        {result.confidence > 0 && (
                          <p className="text-slate-500 text-xs mt-1">ثقة: {result.confidence}%</p>
                        )}
                      </div>
                    </div>
                    <p className={`text-${statusConfig.color}-400 text-sm mt-2`}>{result.message}</p>
                  </div>
                );
              })}
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 ml-2" />
                  قبول
                </Button>
                <Button variant="outline" className="flex-1 border-amber-500/50 text-amber-400">
                  <Eye className="w-4 h-4 ml-2" />
                  مراجعة يدوية
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}