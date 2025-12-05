import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Bed, Heart, Activity, Pill, Calendar, Clock, AlertTriangle,
  Stethoscope, Thermometer, Syringe, FileText, QrCode, MapPin, Bell,
  TrendingUp, TrendingDown, Brain, Eye, Shield, Wifi, Radio, Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// بيانات المرضى
const patientsData = [
  { id: 'P001', name: 'محمد أحمد', mrn: 'MRN-2024-001', age: 45, gender: 'ذكر', ward: 'الباطنة', room: '201-A', status: 'مستقر', admissionDate: '2024-12-01', doctor: 'د. أحمد محمد' },
  { id: 'P002', name: 'فاطمة علي', mrn: 'MRN-2024-002', age: 32, gender: 'أنثى', ward: 'الجراحة', room: '305-B', status: 'تحت المراقبة', admissionDate: '2024-12-03', doctor: 'د. سارة خالد' },
  { id: 'P003', name: 'عبدالله سعيد', mrn: 'MRN-2024-003', age: 68, gender: 'ذكر', ward: 'العناية المركزة', room: 'ICU-05', status: 'حرج', admissionDate: '2024-12-04', doctor: 'د. خالد العلي' },
];

// بيانات ICU
const icuBedsData = [
  { id: 'ICU-01', patient: 'عبدالله سعيد', age: 68, diagnosis: 'فشل قلبي', heartRate: 92, bp: '130/85', spo2: 94, temp: 37.2, ventilator: true, alerts: 1 },
  { id: 'ICU-02', patient: 'نورة فهد', age: 55, diagnosis: 'التهاب رئوي حاد', heartRate: 88, bp: '125/80', spo2: 91, temp: 38.1, ventilator: true, alerts: 2 },
  { id: 'ICU-03', patient: 'خالد محمد', age: 72, diagnosis: 'سكتة دماغية', heartRate: 78, bp: '145/90', spo2: 96, temp: 36.8, ventilator: false, alerts: 0 },
  { id: 'ICU-04', patient: 'فارغ', age: null, diagnosis: null, heartRate: null, bp: null, spo2: null, temp: null, ventilator: false, alerts: 0, empty: true },
];

// بيانات الصيدلية
const pharmacyData = {
  lowStock: [
    { id: 'M001', name: 'أنسولين', current: 15, reorder: 50, unit: 'قلم', category: 'هرمونات', critical: true },
    { id: 'M002', name: 'باراسيتامول 500mg', current: 120, reorder: 200, unit: 'علبة', category: 'مسكنات', critical: false },
    { id: 'M003', name: 'أموكسيسيلين', current: 45, reorder: 100, unit: 'علبة', category: 'مضادات حيوية', critical: true },
  ],
  recentDispensing: [
    { patient: 'محمد أحمد', medication: 'ميتفورمين 500mg', quantity: 30, time: '10:30', nurse: 'أ. سلمى' },
    { patient: 'فاطمة علي', medication: 'إيبوبروفين 400mg', quantity: 20, time: '10:15', nurse: 'أ. نورة' },
  ],
  controlledMeds: [
    { name: 'مورفين', balance: 25, dispensedToday: 3, authorized: 'د. أحمد محمد' },
    { name: 'فنتانيل', balance: 18, dispensedToday: 2, authorized: 'د. خالد العلي' },
  ]
};

// بيانات المواعيد
const appointmentsData = [
  { id: 'A001', patient: 'أحمد سالم', doctor: 'د. محمد علي', department: 'القلب', time: '09:00', status: 'checked_in', queueNumber: 3 },
  { id: 'A002', patient: 'سارة خالد', doctor: 'د. فاطمة أحمد', department: 'الأطفال', time: '09:30', status: 'waiting', queueNumber: 5 },
  { id: 'A003', patient: 'محمود فهد', doctor: 'د. علي سعيد', department: 'العظام', time: '10:00', status: 'in_progress', queueNumber: null },
];

// بيانات العلامات الحيوية
const vitalsTrend = [
  { time: '06:00', heartRate: 78, bp: 120, spo2: 96 },
  { time: '08:00', heartRate: 82, bp: 125, spo2: 95 },
  { time: '10:00', heartRate: 88, bp: 130, spo2: 94 },
  { time: '12:00', heartRate: 85, bp: 128, spo2: 95 },
  { time: '14:00', heartRate: 80, bp: 122, spo2: 96 },
];

export default function AdvancedHospitalModules() {
  const [activeModule, setActiveModule] = useState('patients');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-4" dir="rtl">
      <Tabs value={activeModule} onValueChange={setActiveModule}>
        <TabsList className="bg-slate-800/50 border border-slate-700 flex-wrap">
          <TabsTrigger value="patients" className="data-[state=active]:bg-cyan-500/20">
            <Users className="w-4 h-4 ml-1" />
            إدارة المرضى
          </TabsTrigger>
          <TabsTrigger value="icu" className="data-[state=active]:bg-red-500/20">
            <Heart className="w-4 h-4 ml-1" />
            العناية المركزة
          </TabsTrigger>
          <TabsTrigger value="pharmacy" className="data-[state=active]:bg-green-500/20">
            <Pill className="w-4 h-4 ml-1" />
            الصيدلية
          </TabsTrigger>
          <TabsTrigger value="appointments" className="data-[state=active]:bg-purple-500/20">
            <Calendar className="w-4 h-4 ml-1" />
            المواعيد
          </TabsTrigger>
        </TabsList>

        {/* Patient Management */}
        <TabsContent value="patients" className="mt-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <Input
              placeholder="بحث عن مريض..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs bg-slate-800/50 border-slate-700 text-white"
            />
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Users className="w-4 h-4 ml-2" />
              إضافة مريض
            </Button>
          </div>

          <div className="grid gap-3">
            {patientsData.filter(p => p.name.includes(searchQuery) || p.mrn.includes(searchQuery)).map((patient, i) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 cursor-pointer hover:border-cyan-500/30"
                  onClick={() => { setSelectedPatient(patient); setShowPatientDialog(true); }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          <span className="text-cyan-400 font-bold">{patient.name[0]}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{patient.name}</p>
                          <div className="flex items-center gap-3 text-slate-400 text-sm">
                            <span>{patient.mrn}</span>
                            <span>•</span>
                            <span>{patient.age} سنة</span>
                            <span>•</span>
                            <span>{patient.gender}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-left">
                          <Badge className={`${patient.status === 'حرج' ? 'bg-red-500/20 text-red-400' : patient.status === 'تحت المراقبة' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                            {patient.status}
                          </Badge>
                          <p className="text-slate-500 text-xs mt-1">{patient.ward} - {patient.room}</p>
                        </div>
                        <Button size="sm" variant="outline" className="border-slate-600">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* ICU Monitoring */}
        <TabsContent value="icu" className="mt-4 space-y-4">
          <Card className="glass-card border-red-500/30 bg-red-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                <span className="text-red-300">2 مرضى يحتاجون اهتمام فوري</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {icuBedsData.map((bed, i) => (
              <motion.div
                key={bed.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`glass-card ${bed.empty ? 'border-slate-700 bg-slate-800/30' : bed.alerts > 0 ? 'border-red-500/50 bg-red-500/5' : 'border-green-500/30 bg-[#0f1629]/80'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Bed className={`w-4 h-4 ${bed.empty ? 'text-slate-500' : 'text-cyan-400'}`} />
                        {bed.id}
                      </span>
                      {!bed.empty && bed.alerts > 0 && (
                        <Badge className="bg-red-500/20 text-red-400 animate-pulse">
                          {bed.alerts} تنبيه
                        </Badge>
                      )}
                      {bed.empty && <Badge className="bg-green-500/20 text-green-400">متاح</Badge>}
                    </CardTitle>
                  </CardHeader>
                  {!bed.empty && (
                    <CardContent>
                      <p className="text-white font-medium mb-1">{bed.patient}</p>
                      <p className="text-slate-400 text-sm mb-3">{bed.diagnosis}</p>
                      
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-center p-2 bg-slate-800/50 rounded">
                          <Heart className="w-4 h-4 text-red-400 mx-auto mb-1" />
                          <p className="text-white font-bold text-sm">{bed.heartRate}</p>
                          <p className="text-slate-500 text-[10px]">نبض</p>
                        </div>
                        <div className="text-center p-2 bg-slate-800/50 rounded">
                          <Activity className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                          <p className="text-white font-bold text-sm">{bed.bp}</p>
                          <p className="text-slate-500 text-[10px]">ضغط</p>
                        </div>
                        <div className="text-center p-2 bg-slate-800/50 rounded">
                          <div className={`w-4 h-4 mx-auto mb-1 rounded-full ${bed.spo2 >= 95 ? 'bg-green-500' : bed.spo2 >= 90 ? 'bg-amber-500' : 'bg-red-500'}`} />
                          <p className="text-white font-bold text-sm">{bed.spo2}%</p>
                          <p className="text-slate-500 text-[10px]">أكسجين</p>
                        </div>
                        <div className="text-center p-2 bg-slate-800/50 rounded">
                          <Thermometer className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                          <p className="text-white font-bold text-sm">{bed.temp}°</p>
                          <p className="text-slate-500 text-[10px]">حرارة</p>
                        </div>
                      </div>

                      {bed.ventilator && (
                        <Badge className="mt-2 bg-cyan-500/20 text-cyan-400">
                          <Wifi className="w-3 h-3 ml-1" />
                          جهاز تنفس
                        </Badge>
                      )}
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Vitals Trend */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">اتجاه العلامات الحيوية - ICU-01</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalsTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} name="النبض" />
                    <Line type="monotone" dataKey="spo2" stroke="#22c55e" strokeWidth={2} name="الأكسجين" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pharmacy */}
        <TabsContent value="pharmacy" className="mt-4 space-y-4">
          {/* Low Stock Alert */}
          <Card className="glass-card border-amber-500/30 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-300 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                أدوية تحتاج إعادة طلب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pharmacyData.lowStock.map(med => (
                  <div key={med.id} className={`p-3 rounded-lg flex items-center justify-between ${med.critical ? 'bg-red-500/10 border border-red-500/30' : 'bg-slate-800/50'}`}>
                    <div className="flex items-center gap-3">
                      <Pill className={`w-4 h-4 ${med.critical ? 'text-red-400' : 'text-amber-400'}`} />
                      <div>
                        <p className="text-white text-sm">{med.name}</p>
                        <p className="text-slate-500 text-xs">{med.category}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className={`font-bold ${med.critical ? 'text-red-400' : 'text-amber-400'}`}>
                        {med.current} / {med.reorder} {med.unit}
                      </p>
                      <Progress value={(med.current / med.reorder) * 100} className="h-1 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Recent Dispensing */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">آخر صرفيات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pharmacyData.recentDispensing.map((item, i) => (
                  <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm">{item.medication}</p>
                        <p className="text-slate-400 text-xs">{item.patient}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-cyan-400 text-sm">{item.quantity} وحدة</p>
                        <p className="text-slate-500 text-xs">{item.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Controlled Medications */}
            <Card className="glass-card border-red-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-400" />
                  الأدوية المراقبة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pharmacyData.controlledMeds.map((med, i) => (
                  <div key={i} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm">{med.name}</p>
                        <p className="text-slate-400 text-xs">{med.authorized}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-red-400 font-bold">{med.balance} وحدة</p>
                        <p className="text-slate-500 text-xs">صُرف اليوم: {med.dispensedToday}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appointments */}
        <TabsContent value="appointments" className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-white">45</p>
                <p className="text-cyan-400 text-xs">مواعيد اليوم</p>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-white">28</p>
                <p className="text-green-400 text-xs">تم استقبالهم</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-amber-400 text-xs">في الانتظار</p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4">
              <div className="space-y-3">
                {appointmentsData.map((apt, i) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-4 rounded-lg flex items-center justify-between ${
                      apt.status === 'in_progress' ? 'bg-green-500/10 border border-green-500/30' :
                      apt.status === 'checked_in' ? 'bg-cyan-500/10 border border-cyan-500/30' :
                      'bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {apt.queueNumber && (
                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          <span className="text-cyan-400 font-bold">{apt.queueNumber}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{apt.patient}</p>
                        <p className="text-slate-400 text-sm">{apt.doctor} - {apt.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <p className="text-slate-300">{apt.time}</p>
                        <Badge className={`${
                          apt.status === 'in_progress' ? 'bg-green-500/20 text-green-400' :
                          apt.status === 'checked_in' ? 'bg-cyan-500/20 text-cyan-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {apt.status === 'in_progress' ? 'في العيادة' : apt.status === 'checked_in' ? 'وصل' : 'منتظر'}
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline" className="border-slate-600">
                        <Bell className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Patient Dialog */}
      <Dialog open={showPatientDialog} onOpenChange={setShowPatientDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              ملف المريض - {selectedPatient?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs">رقم الملف</p>
                  <p className="text-white font-medium">{selectedPatient.mrn}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs">الطبيب المعالج</p>
                  <p className="text-white font-medium">{selectedPatient.doctor}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs">القسم / الغرفة</p>
                  <p className="text-white font-medium">{selectedPatient.ward} - {selectedPatient.room}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs">تاريخ الدخول</p>
                  <p className="text-white font-medium">{selectedPatient.admissionDate}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                  <FileText className="w-4 h-4 ml-2" />
                  السجل الطبي
                </Button>
                <Button variant="outline" className="border-purple-500 text-purple-400">
                  <Pill className="w-4 h-4 ml-2" />
                  الأدوية
                </Button>
                <Button variant="outline" className="border-slate-600">
                  <Calendar className="w-4 h-4 ml-2" />
                  المواعيد
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}