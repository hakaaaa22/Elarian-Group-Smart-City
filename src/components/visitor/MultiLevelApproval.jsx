import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch, User, Shield, Building2, CheckCircle, XCircle, Clock,
  ChevronRight, Settings, Plus, Trash2, Edit, Save, Users, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const approvalChains = [
  {
    id: 1,
    name: 'سلسلة الموافقة القياسية',
    riskLevel: 'low',
    isActive: true,
    levels: [
      { level: 1, role: 'مشرف الأمن', approver: 'أحمد السعيد', status: 'pending', requiredTime: '2 ساعة' }
    ]
  },
  {
    id: 2,
    name: 'سلسلة المخاطر المتوسطة',
    riskLevel: 'medium',
    isActive: true,
    levels: [
      { level: 1, role: 'مشرف الأمن', approver: 'أحمد السعيد', status: 'approved', requiredTime: '2 ساعة' },
      { level: 2, role: 'مدير القسم', approver: 'خالد العريان', status: 'pending', requiredTime: '4 ساعات' }
    ]
  },
  {
    id: 3,
    name: 'سلسلة المخاطر العالية',
    riskLevel: 'high',
    isActive: true,
    levels: [
      { level: 1, role: 'مشرف الأمن', approver: 'أحمد السعيد', status: 'approved', requiredTime: '1 ساعة' },
      { level: 2, role: 'مدير الأمن', approver: 'محمد الفهد', status: 'approved', requiredTime: '2 ساعة' },
      { level: 3, role: 'المدير العام', approver: 'خالد العريان', status: 'pending', requiredTime: '4 ساعات' }
    ]
  },
];

const pendingApprovals = [
  { id: 1, visitor: 'سارة خالد', chain: 'سلسلة المخاطر العالية', currentLevel: 3, riskScore: 78, waitingSince: '2 ساعة' },
  { id: 2, visitor: 'محمد أحمد', chain: 'سلسلة المخاطر المتوسطة', currentLevel: 2, riskScore: 45, waitingSince: '30 دقيقة' },
];

const approvers = [
  { id: 1, name: 'أحمد السعيد', role: 'مشرف الأمن', department: 'الأمن', email: 'ahmed@company.com' },
  { id: 2, name: 'محمد الفهد', role: 'مدير الأمن', department: 'الأمن', email: 'mohammed@company.com' },
  { id: 3, name: 'خالد العريان', role: 'المدير العام', department: 'الإدارة', email: 'khaled@company.com' },
  { id: 4, name: 'فاطمة الزهراء', role: 'مدير الموارد', department: 'HR', email: 'fatima@company.com' },
];

export default function MultiLevelApproval() {
  const [chains, setChains] = useState(approvalChains);
  const [showChainDialog, setShowChainDialog] = useState(false);
  const [editingChain, setEditingChain] = useState(null);

  const getRiskColor = (level) => {
    const colors = { low: 'green', medium: 'amber', high: 'red', critical: 'purple' };
    return colors[level] || 'slate';
  };

  const getStatusConfig = (status) => {
    const config = {
      approved: { color: 'green', label: 'تمت الموافقة', icon: CheckCircle },
      rejected: { color: 'red', label: 'مرفوض', icon: XCircle },
      pending: { color: 'amber', label: 'قيد الانتظار', icon: Clock },
    };
    return config[status] || config.pending;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
            <GitBranch className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">سلاسل الموافقة المتعددة</h3>
            <p className="text-slate-500 text-sm">إدارة مستويات الموافقة للتصاريح عالية المخاطر</p>
          </div>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowChainDialog(true)}>
          <Plus className="w-4 h-4 ml-2" />
          سلسلة جديدة
        </Button>
      </div>

      {/* Pending Approvals */}
      <Card className="bg-amber-500/10 border-amber-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-amber-400 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            طلبات بانتظار الموافقة ({pendingApprovals.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingApprovals.map(approval => (
            <div key={approval.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-amber-500/20 text-amber-400">
                    {approval.visitor.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-medium">{approval.visitor}</p>
                  <p className="text-slate-500 text-xs">{approval.chain} - المستوى {approval.currentLevel}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-red-500/20 text-red-400">
                  مخاطر: {approval.riskScore}%
                </Badge>
                <span className="text-slate-500 text-xs">منذ {approval.waitingSince}</span>
                <div className="flex gap-1">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8">
                    <CheckCircle className="w-3 h-3 ml-1" />
                    موافقة
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 h-8">
                    <XCircle className="w-3 h-3 ml-1" />
                    رفض
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Approval Chains */}
      <div className="space-y-4">
        <h4 className="text-white font-medium">سلاسل الموافقة المُعدة</h4>
        {chains.map(chain => (
          <Card key={chain.id} className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${getRiskColor(chain.riskLevel)}-500/20`}>
                    <Shield className={`w-5 h-5 text-${getRiskColor(chain.riskLevel)}-400`} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{chain.name}</h4>
                    <p className="text-slate-500 text-sm">{chain.levels.length} مستويات</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`bg-${getRiskColor(chain.riskLevel)}-500/20 text-${getRiskColor(chain.riskLevel)}-400`}>
                    مستوى المخاطر: {chain.riskLevel === 'low' ? 'منخفض' : chain.riskLevel === 'medium' ? 'متوسط' : 'عالي'}
                  </Badge>
                  <Switch checked={chain.isActive} />
                  <Button size="icon" variant="ghost" onClick={() => setEditingChain(chain)}>
                    <Edit className="w-4 h-4 text-slate-400" />
                  </Button>
                </div>
              </div>

              {/* Approval Flow */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {chain.levels.map((level, i) => {
                  const statusConfig = getStatusConfig(level.status);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <React.Fragment key={level.level}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-3 rounded-lg border min-w-[180px] ${
                          level.status === 'approved' ? 'bg-green-500/10 border-green-500/30' :
                          level.status === 'pending' ? 'bg-amber-500/10 border-amber-500/30' :
                          'bg-red-500/10 border-red-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="border-slate-600">
                            المستوى {level.level}
                          </Badge>
                          <StatusIcon className={`w-4 h-4 text-${statusConfig.color}-400`} />
                        </div>
                        <p className="text-white font-medium text-sm">{level.role}</p>
                        <p className="text-slate-500 text-xs">{level.approver}</p>
                        <p className="text-slate-600 text-xs mt-1">مهلة: {level.requiredTime}</p>
                      </motion.div>
                      {i < chain.levels.length - 1 && (
                        <ChevronRight className="w-5 h-5 text-slate-600 flex-shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Approvers List */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            المعتمدون المتاحون
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {approvers.map(approver => (
              <div key={approver.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-cyan-500/20 text-cyan-400">
                      {approver.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium text-sm">{approver.name}</p>
                    <p className="text-slate-500 text-xs">{approver.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}