import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Zap, CheckCircle, Calendar, FileText, Users, ShoppingCart, AlertTriangle,
  Clock, Loader2, Brain, Target, Mail, Phone, ListTodo, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export default function PostCallAutomation({ callSummary, customerIntent, churnRisk, onTaskCreated }) {
  const [automatedTasks, setAutomatedTasks] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const automationMutation = useMutation({
    mutationFn: async (data) => {
      setIsProcessing(true);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `بناءً على نتائج المكالمة، قم بإنشاء مهام متابعة تلقائية:

ملخص المكالمة: ${data.summary || 'استفسار عن الخدمة'}
نية العميل: ${data.intent || 'غير محددة'}
خطر المغادرة: ${data.churnRisk || 0}%

قم بإنشاء:
1. مهام متابعة CRM
2. جدولة الخطوات التالية
3. سير عمل آلي مناسب
4. إشعارات للفريق المعني`,
        response_json_schema: {
          type: "object",
          properties: {
            tasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  type: { type: "string" },
                  priority: { type: "string" },
                  due_date: { type: "string" },
                  assigned_to: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            workflows: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  trigger: { type: "string" },
                  actions: { type: "array", items: { type: "string" } }
                }
              }
            },
            notifications: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  recipient: { type: "string" },
                  message: { type: "string" },
                  urgency: { type: "string" }
                }
              }
            },
            call_summary: { type: "string" },
            next_best_action: { type: "string" }
          }
        }
      });
      setIsProcessing(false);
      return result;
    },
    onSuccess: async (data) => {
      setAutomatedTasks(data.tasks || []);
      
      // Create tasks in database
      if (data.tasks?.length > 0) {
        for (const task of data.tasks) {
          try {
            await base44.entities.Task.create({
              title: task.title,
              description: task.description,
              priority: task.priority === 'high' ? 'urgent' : task.priority === 'medium' ? 'high' : 'medium',
              status: 'pending',
              category: 'follow_up',
              due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            });
          } catch (e) {
            console.log('Task creation skipped');
          }
        }
      }
      
      onTaskCreated?.(data);
      toast.success(`تم إنشاء ${data.tasks?.length || 0} مهمة متابعة`);
    },
    onError: () => {
      setIsProcessing(false);
      toast.error('حدث خطأ');
    }
  });

  const getTaskIcon = (type) => {
    switch (type) {
      case 'follow_up': return Phone;
      case 'email': return Mail;
      case 'meeting': return Calendar;
      case 'upsell': return ShoppingCart;
      case 'retention': return Users;
      default: return ListTodo;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'amber';
      default: return 'green';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">أتمتة ما بعد المكالمة</h4>
            <p className="text-slate-400 text-xs">Post-Call Automation</p>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => automationMutation.mutate({
            summary: callSummary,
            intent: customerIntent,
            churnRisk
          })}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <><Sparkles className="w-4 h-4 ml-1" /> إنشاء مهام</>
          )}
        </Button>
      </div>

      {/* Context Cards */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-2 text-center">
            <Target className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <p className="text-white text-xs font-medium">{customerIntent || 'استفسار'}</p>
            <p className="text-slate-400 text-xs">نية العميل</p>
          </CardContent>
        </Card>
        <Card className={`bg-${churnRisk > 50 ? 'red' : churnRisk > 25 ? 'amber' : 'green'}-500/10 border-${churnRisk > 50 ? 'red' : churnRisk > 25 ? 'amber' : 'green'}-500/30`}>
          <CardContent className="p-2 text-center">
            <AlertTriangle className={`w-4 h-4 text-${churnRisk > 50 ? 'red' : churnRisk > 25 ? 'amber' : 'green'}-400 mx-auto mb-1`} />
            <p className="text-white text-xs font-medium">{churnRisk || 0}%</p>
            <p className="text-slate-400 text-xs">خطر المغادرة</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-2 text-center">
            <ListTodo className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <p className="text-white text-xs font-medium">{automatedTasks.length}</p>
            <p className="text-slate-400 text-xs">مهام منشأة</p>
          </CardContent>
        </Card>
      </div>

      {/* Automated Tasks */}
      {automatedTasks.length > 0 && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              المهام التلقائية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {automatedTasks.map((task, i) => {
                  const TaskIcon = getTaskIcon(task.type);
                  const priorityColor = getPriorityColor(task.priority);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-3 bg-slate-900/50 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-${priorityColor}-500/20`}>
                          <TaskIcon className={`w-4 h-4 text-${priorityColor}-400`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-white text-sm font-medium truncate">{task.title}</p>
                            <Badge className={`bg-${priorityColor}-500/20 text-${priorityColor}-400 text-xs`}>
                              {task.priority === 'high' ? 'عاجل' : task.priority === 'medium' ? 'متوسط' : 'عادي'}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-xs line-clamp-2">{task.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-slate-500 text-xs">
                              <Clock className="w-3 h-3" />
                              {task.due_date}
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 text-xs">
                              <Users className="w-3 h-3" />
                              {task.assigned_to}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-400 text-xs">
          <Mail className="w-3 h-3 ml-1" />
          إرسال ملخص للعميل
        </Button>
        <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-400 text-xs">
          <Calendar className="w-3 h-3 ml-1" />
          جدولة متابعة
        </Button>
      </div>
    </div>
  );
}