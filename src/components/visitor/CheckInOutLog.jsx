import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserCheck, UserX, Search, Filter, Calendar, Clock, DoorOpen,
  Car, Camera, Eye, Download, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const mockLogs = [
  {
    id: 1, visitor_name: 'أحمد محمد', permit_number: 'P-2024-001', type: 'checkin',
    gate: 'البوابة الرئيسية', timestamp: '2024-12-04 09:45:32', method: 'qr_code',
    vehicle: { has: true, plate: 'ABC 1234' }, host: 'خالد العلي', photo: true, verified: true
  },
  {
    id: 2, visitor_name: 'سارة أحمد', permit_number: 'P-2024-002', type: 'checkout',
    gate: 'بوابة الموظفين', timestamp: '2024-12-04 09:30:15', method: 'face_recognition',
    vehicle: { has: false }, host: 'محمد السعيد', photo: true, verified: true
  },
  {
    id: 3, visitor_name: 'محمد علي', permit_number: 'P-2024-003', type: 'checkin',
    gate: 'بوابة الشحن', timestamp: '2024-12-04 09:15:45', method: 'manual',
    vehicle: { has: true, plate: 'DEF 9012' }, host: 'فاطمة الزهراء', photo: true, verified: true
  },
  {
    id: 4, visitor_name: 'خالد العلي', permit_number: 'P-2024-004', type: 'checkin',
    gate: 'البوابة الرئيسية', timestamp: '2024-12-04 09:00:22', method: 'lpr',
    vehicle: { has: true, plate: 'GHI 3456' }, host: 'أحمد السعيد', photo: false, verified: true
  },
  {
    id: 5, visitor_name: 'فهد السعيد', permit_number: 'P-2024-005', type: 'checkout',
    gate: 'البوابة الرئيسية', timestamp: '2024-12-04 08:45:10', method: 'qr_code',
    vehicle: { has: false }, host: 'سارة محمد', photo: true, verified: true
  },
];

const gates = ['الكل', 'البوابة الرئيسية', 'بوابة الموظفين', 'بوابة الشحن', 'بوابة الطوارئ'];
const methods = { qr_code: 'QR Code', face_recognition: 'التعرف على الوجه', lpr: 'قراءة اللوحات', manual: 'يدوي' };

export default function CheckInOutLog() {
  const [logs, setLogs] = useState(mockLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterGate, setFilterGate] = useState('الكل');
  const [filterDate, setFilterDate] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.visitor_name.includes(searchQuery) || log.permit_number.includes(searchQuery);
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesGate = filterGate === 'الكل' || log.gate === filterGate;
    return matchesSearch && matchesType && matchesGate;
  });

  const stats = {
    totalToday: logs.length,
    checkIns: logs.filter(l => l.type === 'checkin').length,
    checkOuts: logs.filter(l => l.type === 'checkout').length,
    withVehicle: logs.filter(l => l.vehicle?.has).length,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'إجمالي السجلات', value: stats.totalToday, color: 'cyan' },
          { label: 'عمليات الدخول', value: stats.checkIns, color: 'green' },
          { label: 'عمليات الخروج', value: stats.checkOuts, color: 'slate' },
          { label: 'مع مركبة', value: stats.withVehicle, color: 'amber' },
        ].map((stat, i) => (
          <Card key={i} className={`bg-${stat.color}-500/10 border-${stat.color}-500/30`}>
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
              <p className="text-slate-400 text-xs">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="بحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="checkin">دخول</SelectItem>
                <SelectItem value="checkout">خروج</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterGate} onValueChange={setFilterGate}>
              <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="البوابة" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {gates.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-40 bg-slate-800/50 border-slate-700 text-white"
            />
            <Button variant="outline" className="border-slate-600">
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr className="text-slate-400 text-sm">
                  <th className="p-3 text-right">النوع</th>
                  <th className="p-3 text-right">الزائر</th>
                  <th className="p-3 text-right">رقم التصريح</th>
                  <th className="p-3 text-right">البوابة</th>
                  <th className="p-3 text-right">الوقت</th>
                  <th className="p-3 text-right">الطريقة</th>
                  <th className="p-3 text-right">المركبة</th>
                  <th className="p-3 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, i) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-t border-slate-700/50 hover:bg-slate-800/30"
                  >
                    <td className="p-3">
                      <Badge className={log.type === 'checkin' ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/20 text-slate-400'}>
                        {log.type === 'checkin' ? <UserCheck className="w-3 h-3 ml-1" /> : <UserX className="w-3 h-3 ml-1" />}
                        {log.type === 'checkin' ? 'دخول' : 'خروج'}
                      </Badge>
                    </td>
                    <td className="p-3 text-white font-medium">{log.visitor_name}</td>
                    <td className="p-3 text-slate-400 font-mono text-sm">{log.permit_number}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                        <DoorOpen className="w-3 h-3 ml-1" />
                        {log.gate}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-300 text-sm">{log.timestamp}</td>
                    <td className="p-3">
                      <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                        {methods[log.method]}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {log.vehicle?.has ? (
                        <Badge className="bg-amber-500/20 text-amber-400">
                          <Car className="w-3 h-3 ml-1" />
                          {log.vehicle.plate}
                        </Badge>
                      ) : (
                        <span className="text-slate-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelectedLog(log)}>
                          <Eye className="w-4 h-4 text-slate-400" />
                        </Button>
                        {log.photo && (
                          <Button size="icon" variant="ghost" className="h-7 w-7">
                            <Camera className="w-4 h-4 text-slate-400" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between p-3 border-t border-slate-700/50">
            <span className="text-slate-400 text-sm">عرض {filteredLogs.length} من {logs.length}</span>
            <div className="flex gap-1">
              <Button size="icon" variant="outline" className="h-8 w-8 border-slate-600">
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8 border-slate-600">
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">تفاصيل السجل</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'الزائر', value: selectedLog.visitor_name },
                  { label: 'رقم التصريح', value: selectedLog.permit_number },
                  { label: 'النوع', value: selectedLog.type === 'checkin' ? 'دخول' : 'خروج' },
                  { label: 'البوابة', value: selectedLog.gate },
                  { label: 'الوقت', value: selectedLog.timestamp },
                  { label: 'الطريقة', value: methods[selectedLog.method] },
                  { label: 'المضيف', value: selectedLog.host },
                  { label: 'التحقق', value: selectedLog.verified ? 'تم التحقق' : 'لم يتم' },
                ].map((item, i) => (
                  <div key={i} className="p-2 bg-slate-800/50 rounded-lg">
                    <p className="text-slate-400 text-xs">{item.label}</p>
                    <p className="text-white text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
              {selectedLog.vehicle?.has && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-300 font-medium text-sm mb-2">بيانات المركبة</p>
                  <p className="text-white">لوحة: {selectedLog.vehicle.plate}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}