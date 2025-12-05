import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, Sparkles, TrendingUp, AlertTriangle, FileText,
  Loader2, ChevronDown, ChevronUp, Target, Lightbulb, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const severityColors = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function AIIncidentAnalysis({ incidents = [] }) {
  const [analysis, setAnalysis] = useState(null);
  const [expandedSection, setExpandedSection] = useState('patterns');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [report, setReport] = useState(null);

  const analysisMutation = useMutation({
    mutationFn: async () => {
      const incidentData = incidents.map(i => ({
        id: i.id || i.incident_id,
        title: i.title,
        severity: i.severity,
        status: i.status,
        location: i.location,
        category: i.category,
        created: i.created_date
      }));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze these security/traffic incidents and provide insights:

${JSON.stringify(incidentData, null, 2)}

Provide:
1. Pattern Analysis: Identify recurring patterns (time-based, location-based, type-based)
2. Root Cause Analysis: Suggest potential root causes for clusters of similar incidents
3. Priority Recommendations: Re-prioritize incidents based on impact and urgency
4. Predictive Insights: Predict potential future incidents based on patterns

Be specific and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            patterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pattern_name: { type: "string" },
                  description: { type: "string" },
                  affected_incidents: { type: "number" },
                  confidence: { type: "number" }
                }
              }
            },
            root_causes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  cause: { type: "string" },
                  evidence: { type: "string" },
                  recommendation: { type: "string" }
                }
              }
            },
            priority_adjustments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  incident_id: { type: "string" },
                  current_severity: { type: "string" },
                  recommended_severity: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  prediction: { type: "string" },
                  likelihood: { type: "string" },
                  timeframe: { type: "string" },
                  prevention_action: { type: "string" }
                }
              }
            },
            summary: { type: "string" }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast.success('AI analysis complete');
    },
    onError: () => {
      toast.error('Analysis failed');
    }
  });

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      setIsGeneratingReport(true);
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate an executive incident summary report based on this analysis:

Incidents: ${incidents.length} total
Analysis: ${JSON.stringify(analysis, null, 2)}

Create a professional stakeholder report with:
1. Executive Summary (2-3 sentences)
2. Key Metrics
3. Critical Findings
4. Recommended Actions
5. Risk Assessment

Format in clear sections with bullet points.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            key_metrics: {
              type: "object",
              properties: {
                total_incidents: { type: "number" },
                critical_count: { type: "number" },
                resolution_rate: { type: "string" },
                avg_response_time: { type: "string" }
              }
            },
            critical_findings: {
              type: "array",
              items: { type: "string" }
            },
            recommended_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            risk_level: { type: "string" },
            risk_description: { type: "string" }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setReport(data);
      setIsGeneratingReport(false);
      toast.success('Report generated');
    },
    onError: () => {
      setIsGeneratingReport(false);
      toast.error('Report generation failed');
    }
  });

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-4">
      {/* AI Analysis Header */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              AI Incident Analysis
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => analysisMutation.mutate()}
                disabled={analysisMutation.isPending || incidents.length === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {analysisMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Analyze Incidents
              </Button>
              {analysis && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generateReportMutation.mutate()}
                  disabled={isGeneratingReport}
                  className="border-cyan-500/50 text-cyan-400"
                >
                  {isGeneratingReport ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  Generate Report
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {analysis && (
          <CardContent className="pt-0 space-y-3">
            {/* Summary */}
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-slate-300 text-sm">{analysis.summary}</p>
            </div>

            {/* Patterns Section */}
            <div className="border border-slate-700/50 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('patterns')}
                className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span className="text-white font-medium">Pattern Analysis</span>
                  <Badge variant="outline" className="text-slate-400 border-slate-600">
                    {analysis.patterns?.length || 0} patterns
                  </Badge>
                </div>
                {expandedSection === 'patterns' ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>
              <AnimatePresence>
                {expandedSection === 'patterns' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 space-y-2">
                      {analysis.patterns?.map((pattern, i) => (
                        <div key={i} className="p-3 bg-slate-800/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium text-sm">{pattern.pattern_name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">{pattern.affected_incidents} incidents</span>
                              <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                                {pattern.confidence}% confidence
                              </Badge>
                            </div>
                          </div>
                          <p className="text-slate-400 text-sm">{pattern.description}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Root Causes Section */}
            <div className="border border-slate-700/50 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('causes')}
                className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span className="text-white font-medium">Root Causes</span>
                  <Badge variant="outline" className="text-slate-400 border-slate-600">
                    {analysis.root_causes?.length || 0} identified
                  </Badge>
                </div>
                {expandedSection === 'causes' ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>
              <AnimatePresence>
                {expandedSection === 'causes' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 space-y-2">
                      {analysis.root_causes?.map((cause, i) => (
                        <div key={i} className="p-3 bg-slate-800/30 rounded-lg">
                          <p className="text-white font-medium text-sm mb-1">{cause.cause}</p>
                          <p className="text-slate-400 text-xs mb-2">{cause.evidence}</p>
                          <div className="flex items-center gap-2 text-emerald-400 text-xs">
                            <Lightbulb className="w-3 h-3" />
                            {cause.recommendation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Priority Adjustments Section */}
            <div className="border border-slate-700/50 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('priority')}
                className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-white font-medium">Priority Recommendations</span>
                  <Badge variant="outline" className="text-slate-400 border-slate-600">
                    {analysis.priority_adjustments?.length || 0} adjustments
                  </Badge>
                </div>
                {expandedSection === 'priority' ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>
              <AnimatePresence>
                {expandedSection === 'priority' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 space-y-2">
                      {analysis.priority_adjustments?.map((adj, i) => (
                        <div key={i} className="p-3 bg-slate-800/30 rounded-lg flex items-center justify-between">
                          <div>
                            <span className="text-white text-sm">{adj.incident_id}</span>
                            <p className="text-slate-400 text-xs">{adj.reason}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${severityColors[adj.current_severity]} border text-xs`}>
                              {adj.current_severity}
                            </Badge>
                            <span className="text-slate-500">→</span>
                            <Badge className={`${severityColors[adj.recommended_severity]} border text-xs`}>
                              {adj.recommended_severity}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Predictions Section */}
            <div className="border border-slate-700/50 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('predictions')}
                className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-medium">Predictive Insights</span>
                </div>
                {expandedSection === 'predictions' ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>
              <AnimatePresence>
                {expandedSection === 'predictions' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 space-y-2">
                      {analysis.predictions?.map((pred, i) => (
                        <div key={i} className="p-3 bg-slate-800/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white text-sm">{pred.prediction}</span>
                            <div className="flex gap-2">
                              <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                                {pred.likelihood}
                              </Badge>
                              <Badge variant="outline" className="text-slate-400 border-slate-600 text-xs">
                                {pred.timeframe}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-emerald-400 text-xs flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" />
                            Prevention: {pred.prevention_action}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Generated Report */}
      <AnimatePresence>
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="glass-card border-cyan-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Executive Summary Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-white">{report.executive_summary}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-white">{report.key_metrics?.total_incidents || 0}</p>
                    <p className="text-xs text-slate-400">Total Incidents</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-400">{report.key_metrics?.critical_count || 0}</p>
                    <p className="text-xs text-slate-400">Critical</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-emerald-400">{report.key_metrics?.resolution_rate || 'N/A'}</p>
                    <p className="text-xs text-slate-400">Resolution Rate</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-cyan-400">{report.key_metrics?.avg_response_time || 'N/A'}</p>
                    <p className="text-xs text-slate-400">Avg Response</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Critical Findings</h4>
                  <ul className="space-y-1">
                    {report.critical_findings?.map((finding, i) => (
                      <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                        <span className="text-amber-400 mt-1">•</span>
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Recommended Actions</h4>
                  <div className="space-y-2">
                    {report.recommended_actions?.map((action, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg">
                        <span className="text-slate-300 text-sm">{action.action}</span>
                        <div className="flex gap-2">
                          <Badge className={`text-xs ${
                            action.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                            action.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {action.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${
                  report.risk_level === 'High' ? 'bg-red-500/10 border-red-500/30' :
                  report.risk_level === 'Medium' ? 'bg-amber-500/10 border-amber-500/30' :
                  'bg-green-500/10 border-green-500/30'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className={`w-4 h-4 ${
                      report.risk_level === 'High' ? 'text-red-400' :
                      report.risk_level === 'Medium' ? 'text-amber-400' :
                      'text-green-400'
                    }`} />
                    <span className="text-white font-medium">Risk Level: {report.risk_level}</span>
                  </div>
                  <p className="text-slate-400 text-sm">{report.risk_description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}