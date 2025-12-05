import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  AlertTriangle, Filter, X, MapPin, Clock, User, Activity,
  ChevronDown, Search, MoreVertical, Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIIncidentAnalysis from '@/components/incidents/AIIncidentAnalysis';

const severityColors = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  resolved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const mockIncidents = [
  { id: 'INC-00245', severity: 'critical', title: 'Unauthorized access detected', location: 'Building A, 1st Floor', date: new Date(), status: 'open', assigned: ['John Smith', 'Maria Garcia'] },
  { id: 'INC-00244', severity: 'high', title: 'Fire alarm activated', location: 'Entry Gate 3', date: new Date(), status: 'open', assigned: ['John Smith'] },
  { id: 'INC-00243', severity: 'medium', title: 'Suspected access denied', location: 'Entry Gate 3', date: new Date(), status: 'open', assigned: [] },
  { id: 'INC-00242', severity: 'medium', title: 'Electrical anomaly detected', location: 'Entry Gate 3', date: new Date(), status: 'open', assigned: ['Maria Garcia'] },
  { id: 'INC-00241', severity: 'low', title: 'Unplugged access detected', location: 'Building C, 1 Floor', date: new Date(), status: 'open', assigned: [] },
  { id: 'INC-00240', severity: 'resolved', title: 'Fair alarm activated', location: 'Entry Gate 4', date: new Date(), status: 'resolved', assigned: ['John Smith'] },
  { id: 'INC-00239', severity: 'low', title: 'Interrupted suspicion', location: 'Entry Gate 2', date: new Date(), status: 'resolved', assigned: [] },
];

export default function IncidentCenter() {
  const [selectedIncident, setSelectedIncident] = useState(mockIncidents[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('incidents');

  const stats = [
    { label: 'Critical Incidents', value: 12, color: 'red' },
    { label: 'High Incidents', value: 37, color: 'orange' },
    { label: 'Medium Incidents', value: 102, color: 'yellow' },
    { label: 'Low Incidents', value: 128, color: 'green' },
  ];

  const filteredIncidents = mockIncidents.filter(inc => {
    const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || inc.severity === severityFilter;
    const matchesSearch = inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inc.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSeverity && matchesSearch;
  });

  return (
    <div className="min-h-screen p-4 lg:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
          INCIDENT CENTER
        </h1>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="incidents" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Incidents
          </TabsTrigger>
          <TabsTrigger value="ai-analysis" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Brain className="w-4 h-4 mr-2" />
            AI Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incidents">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Filters */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search incidents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="border-slate-700 text-slate-400 hover:text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Incidents Table */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-400">ID</TableHead>
                    <TableHead className="text-slate-400">SEVERITY</TableHead>
                    <TableHead className="text-slate-400">DESCRIPTION</TableHead>
                    <TableHead className="text-slate-400">LOCATION</TableHead>
                    <TableHead className="text-slate-400">DATE</TableHead>
                    <TableHead className="text-slate-400">STATUS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents.map((incident) => (
                    <TableRow
                      key={incident.id}
                      className={`border-slate-700/50 cursor-pointer transition-colors ${
                        selectedIncident?.id === incident.id ? 'bg-indigo-500/10' : 'hover:bg-slate-800/50'
                      }`}
                      onClick={() => setSelectedIncident(incident)}
                    >
                      <TableCell className="text-white font-mono">{incident.id}</TableCell>
                      <TableCell>
                        <Badge className={`${severityColors[incident.severity]} border uppercase text-xs`}>
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">{incident.title}</TableCell>
                      <TableCell className="text-slate-400">{incident.location}</TableCell>
                      <TableCell className="text-slate-400">
                        {format(incident.date, 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs ${incident.status === 'open' ? 'text-cyan-400' : 'text-emerald-400'}`}>
                          {incident.status === 'open' ? 'Open' : 'Resolved'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedIncident && (
              <motion.div
                key={selectedIncident.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 sticky top-6">
                  <CardHeader className="border-b border-slate-700/50 pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">DETAILS</CardTitle>
                      <Button variant="ghost" size="icon" className="text-slate-400">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-6">
                    <div>
                      <p className="text-slate-400 text-sm">{selectedIncident.id}</p>
                      <p className="text-white font-medium mt-1">{selectedIncident.title}</p>
                      <div className="flex gap-2 mt-3">
                        <Badge className={`${severityColors[selectedIncident.severity]} border`}>
                          {selectedIncident.severity}
                        </Badge>
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 border">
                          {selectedIncident.status}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Location</p>
                      <div className="flex items-center gap-2 text-white">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        {selectedIncident.location}
                      </div>
                    </div>

                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Timeline</p>
                      <div className="flex items-center gap-2 text-white">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        {format(selectedIncident.date, 'MMM d, yyyy, h:mm a')}
                      </div>
                      <p className="text-slate-500 text-sm mt-2 ml-6">
                        IP address 192.168.1.10 attempted to access restricted area via Card Reader 078
                      </p>
                    </div>

                    {selectedIncident.assigned.length > 0 && (
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Responders</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedIncident.assigned.map((person) => (
                            <div key={person} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                                <span className="text-xs text-white">{person[0]}</span>
                              </div>
                              <span className="text-white text-sm">{person}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Activity</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                          <span className="text-slate-300">Alert triggered</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                          <span className="text-slate-300">Camera 12 viewed</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai-analysis">
          <AIIncidentAnalysis incidents={mockIncidents} />
        </TabsContent>
      </Tabs>
    </div>
  );
}