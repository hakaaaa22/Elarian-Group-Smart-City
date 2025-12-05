import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  History, Wrench, Calendar, User, DollarSign, Clock,
  CheckCircle, AlertTriangle, Search, Filter, ChevronRight,
  Package, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';

const maintenanceHistory = [
  {
    id: 1,
    device: 'مكيف غرفة المعيشة',
    deviceType: 'تكييف',
    records: [
      {
        id: 101,
        date: '2024-12-01',
        type: 'صيانة وقائية',
        technician: 'محمد أحمد',
        description: 'تنظيف الفلتر وفحص مستوى الفريون',
        duration: 1.5,
        cost: 200,
        partsUsed: [{ name: 'فلتر', quantity: 1 }],
        notes: 'الجهاز بحالة جيدة'
      },
      {
        id: 102,
        date: '2024-09-15',
        type: 'إصلاح',
        technician: 'خالد العلي',
        description: 'إصلاح مشكلة التسريب',
        duration: 3,
        cost: 450,
        partsUsed: [{ name: 'أنبوب صرف', quantity: 1 }],
        notes: 'تم استبدال أنبوب الصرف المسدود'
      },
      {
        id: 103,
        date: '2024-06-20',
        type: 'صيانة وقائية',
        technician: 'محمد أحمد',
        description: 'صيانة دورية صيفية',
        duration: 2,
        cost: 300,
        partsUsed: [{ name: 'فلتر', quantity: 1 }, { name: 'غاز فريون', quantity: 0.5 }],
        notes: 'تم شحن الفريون'
      }
    ]
  },
  {
    id: 2,
    device: 'كاميرا البوابة الرئيسية',
    deviceType: 'كاميرات',
    records: [
      {
        id: 201,
        date: '2024-11-20',
        type: 'إصلاح',
        technician: 'خالد العلي',
        description: 'إصلاح مشكلة الرؤية الليلية',
        duration: 2,
        cost: 350,
        partsUsed: [{ name: 'LED IR', quantity: 4 }],
        notes: 'تم استبدال مصابيح الأشعة تحت الحمراء'
      },
      {
        id: 202,
        date: '2024-08-10',
        type: 'صيانة وقائية',
        technician: 'فهد السعيد',
        description: 'تنظيف العدسة وفحص الاتصال',
        duration: 1,
        cost: 150,
        partsUsed: [],
        notes: 'الكاميرا تعمل بشكل طبيعي'
      }
    ]
  },
  {
    id: 3,
    device: 'حساس حركة المستودع',
    deviceType: 'أمن',
    records: [
      {
        id: 301,
        date: '2024-10-05',
        type: 'استبدال',
        technician: 'فهد السعيد',
        description: 'استبدال البطارية',
        duration: 0.5,
        cost: 120,
        partsUsed: [{ name: 'بطارية CR123A', quantity: 1 }],
        notes: 'تم إعادة المعايرة'
      }
    ]
  }
];

export default function DeviceMaintenanceHistory({ onSelectRecord }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const filteredDevices = maintenanceHistory.filter(d =>
    d.device.includes(searchQuery) || d.deviceType.includes(searchQuery)
  );

  const typeColors = {
    'صيانة وقائية': 'bg-green-500/20 text-green-400',
    'إصلاح': 'bg-amber-500/20 text-amber-400',
    'استبدال': 'bg-purple-500/20 text-purple-400',
    'فحص': 'bg-blue-500/20 text-blue-400'
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="بحث عن جهاز..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10 bg-slate-800/50 border-slate-700 text-white"
        />
      </div>

      {/* Devices List */}
      <div className="space-y-3">
        {filteredDevices.map((device) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setSelectedDevice(selectedDevice?.id === device.id ? null : device)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/20">
                      <Wrench className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{device.device}</h3>
                      <p className="text-slate-400 text-sm">{device.deviceType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-slate-500/20 text-slate-400">
                      {device.records.length} سجل
                    </Badge>
                    <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${
                      selectedDevice?.id === device.id ? 'rotate-90' : ''
                    }`} />
                  </div>
                </div>

                {/* Expanded Records */}
                {selectedDevice?.id === device.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-slate-700/50"
                  >
                    <div className="space-y-2">
                      {device.records.map((record) => (
                        <div
                          key={record.id}
                          className="p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800/70 transition-colors"
                          onClick={() => setSelectedRecord(record)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={typeColors[record.type]}>{record.type}</Badge>
                              <span className="text-slate-400 text-xs">
                                <Calendar className="w-3 h-3 inline ml-1" />
                                {record.date}
                              </span>
                            </div>
                            <span className="text-slate-500 text-xs">
                              <User className="w-3 h-3 inline ml-1" />
                              {record.technician}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm">{record.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span><Clock className="w-3 h-3 inline ml-1" />{record.duration} ساعة</span>
                            <span><DollarSign className="w-3 h-3 inline ml-1" />{record.cost} ر.س</span>
                            {record.partsUsed.length > 0 && (
                              <span><Package className="w-3 h-3 inline ml-1" />{record.partsUsed.length} قطعة</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Record Detail Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              تفاصيل سجل الصيانة
            </DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-2 justify-between">
                <Badge className={typeColors[selectedRecord.type]}>{selectedRecord.type}</Badge>
                <span className="text-slate-400 text-sm">{selectedRecord.date}</span>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-white">{selectedRecord.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 bg-slate-800/30 rounded text-center">
                  <p className="text-cyan-400 font-bold">{selectedRecord.technician}</p>
                  <p className="text-slate-500 text-xs">الفني</p>
                </div>
                <div className="p-2 bg-slate-800/30 rounded text-center">
                  <p className="text-green-400 font-bold">{selectedRecord.duration} ساعة</p>
                  <p className="text-slate-500 text-xs">المدة</p>
                </div>
              </div>

              {selectedRecord.partsUsed.length > 0 && (
                <div>
                  <p className="text-slate-300 text-sm mb-2">القطع المستخدمة:</p>
                  <div className="space-y-1">
                    {selectedRecord.partsUsed.map((part, i) => (
                      <div key={i} className="flex justify-between p-2 bg-slate-800/30 rounded">
                        <span className="text-white text-sm">{part.name}</span>
                        <span className="text-slate-400 text-sm">× {part.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-amber-400 text-xs mb-1">ملاحظات:</p>
                <p className="text-slate-300 text-sm">{selectedRecord.notes}</p>
              </div>

              <div className="flex justify-between p-3 bg-green-500/10 rounded-lg">
                <span className="text-white">التكلفة</span>
                <span className="text-green-400 font-bold">{selectedRecord.cost} ر.س</span>
              </div>

              <Button
                className="w-full bg-cyan-600 hover:bg-cyan-700"
                onClick={() => {
                  onSelectRecord?.(selectedRecord);
                  setSelectedRecord(null);
                }}
              >
                <FileText className="w-4 h-4 ml-2" />
                استخدام كمرجع
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}