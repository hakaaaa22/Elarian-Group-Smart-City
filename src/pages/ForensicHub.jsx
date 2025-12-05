import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Camera, Clock, MapPin, User, Calendar,
  FileVideo, Image, Filter, Download, ChevronRight, Play
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

const searchResults = [
  { id: 1, type: 'video', camera: 'CAM-001', location: 'Main Entrance', timestamp: new Date(), duration: '00:45', thumbnail: 'https://images.unsplash.com/photo-1517732306149-e8f829eb588a?w=300&h=200&fit=crop', match: 'Face detected' },
  { id: 2, type: 'video', camera: 'CAM-003', location: 'Parking Lot A', timestamp: new Date(Date.now() - 3600000), duration: '01:23', thumbnail: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=300&h=200&fit=crop', match: 'Vehicle PF21 LHT' },
  { id: 3, type: 'image', camera: 'CAM-007', location: 'Warehouse', timestamp: new Date(Date.now() - 7200000), duration: null, thumbnail: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=300&h=200&fit=crop', match: 'Suspicious activity' },
  { id: 4, type: 'video', camera: 'CAM-012', location: 'Loading Dock', timestamp: new Date(Date.now() - 10800000), duration: '02:15', thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&h=200&fit=crop', match: 'Motion detected' },
];

const recentSearches = [
  'Vehicle PF21 LHT',
  'Face match - John Smith',
  'Suspicious activity Zone A',
  'Motion detection 2024-01-15',
];

export default function ForensicHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <Search className="w-8 h-8 text-cyan-400" />
          Forensic Hub
        </h1>
        <p className="text-slate-400 mt-1">Advanced video search and evidence retrieval</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search by face, vehicle, location, time, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 text-lg bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-slate-700 text-slate-400 hover:text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" className="border-slate-700 text-slate-400 hover:text-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  Date Range
                </Button>
                <Button className="bg-cyan-500 hover:bg-cyan-600">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Recent Searches */}
            <div className="mt-4">
              <p className="text-slate-400 text-sm mb-2">Recent searches:</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, i) => (
                  <Badge
                    key={i}
                    className="bg-slate-800/50 text-slate-300 border-slate-700 cursor-pointer hover:bg-slate-700"
                    onClick={() => setSearchQuery(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Search Results */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="border-b border-slate-700/50">
              <CardTitle className="text-white flex items-center justify-between">
                <span>Search Results</span>
                <span className="text-sm text-slate-400 font-normal">{searchResults.length} results found</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid md:grid-cols-2 gap-4">
                {searchResults.map((result, i) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setSelectedResult(result)}
                    className={`rounded-xl overflow-hidden cursor-pointer transition-all ${
                      selectedResult?.id === result.id 
                        ? 'ring-2 ring-cyan-500' 
                        : 'hover:ring-1 hover:ring-indigo-500/50'
                    }`}
                  >
                    <div className="relative aspect-video bg-slate-900">
                      <img 
                        src={result.thumbnail} 
                        alt="" 
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                      
                      {result.type === 'video' && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-slate-900/80 rounded-md flex items-center gap-1">
                          <FileVideo className="w-3 h-3 text-cyan-400" />
                          <span className="text-white text-xs">{result.duration}</span>
                        </div>
                      )}
                      
                      {result.type === 'image' && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-slate-900/80 rounded-md">
                          <Image className="w-3 h-3 text-purple-400" />
                        </div>
                      )}

                      <div className="absolute bottom-2 left-2 right-2">
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 border mb-2">
                          {result.match}
                        </Badge>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300">{result.camera} • {result.location}</span>
                        </div>
                      </div>

                      {result.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Play className="w-6 h-6 text-white ml-1" />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Details Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 sticky top-6">
            <CardHeader className="border-b border-slate-700/50">
              <CardTitle className="text-white">Evidence Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {selectedResult ? (
                <div className="space-y-4">
                  <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
                    <img 
                      src={selectedResult.thumbnail} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Camera className="w-4 h-4 text-cyan-400" />
                      <div>
                        <p className="text-slate-400 text-xs">Camera</p>
                        <p className="text-white">{selectedResult.camera}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-slate-400 text-xs">Location</p>
                        <p className="text-white">{selectedResult.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <div>
                        <p className="text-slate-400 text-xs">Timestamp</p>
                        <p className="text-white">{format(selectedResult.timestamp, 'MMM d, yyyy • h:mm a')}</p>
                      </div>
                    </div>

                    {selectedResult.duration && (
                      <div className="flex items-center gap-3 text-sm">
                        <FileVideo className="w-4 h-4 text-emerald-400" />
                        <div>
                          <p className="text-slate-400 text-xs">Duration</p>
                          <p className="text-white">{selectedResult.duration}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-700/50 space-y-2">
                    <Button className="w-full bg-cyan-500 hover:bg-cyan-600">
                      <Play className="w-4 h-4 mr-2" />
                      View Full Recording
                    </Button>
                    <Button variant="outline" className="w-full border-slate-700 text-slate-400 hover:text-white">
                      <Download className="w-4 h-4 mr-2" />
                      Export Evidence
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Select a result to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}