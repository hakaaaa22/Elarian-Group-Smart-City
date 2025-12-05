import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger
} from '@/components/ui/collapsible';

export default function AdvancedSearch({ 
  searchQuery, 
  onSearchChange, 
  filters = [], 
  activeFilters = {}, 
  onFilterChange,
  onClearFilters,
  placeholder = "بحث..."
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFilterCount = Object.values(activeFilters).filter(v => v && v !== 'all').length;

  return (
    <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pr-9 bg-slate-800/50 border-slate-700 text-white"
            />
          </div>
          
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="border-slate-600 gap-2">
                <Filter className="w-4 h-4" />
                فلاتر
                {activeFilterCount > 0 && (
                  <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">{activeFilterCount}</Badge>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
          </Collapsible>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" className="text-red-400" onClick={onClearFilters}>
              <X className="w-4 h-4 ml-1" />
              مسح الفلاتر
            </Button>
          )}
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-700/50">
              {filters.map(filter => (
                <div key={filter.id}>
                  <Label className="text-slate-400 text-xs mb-1 block">{filter.label}</Label>
                  {filter.type === 'select' ? (
                    <Select 
                      value={activeFilters[filter.id] || 'all'} 
                      onValueChange={(v) => onFilterChange(filter.id, v)}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">الكل</SelectItem>
                        {filter.options.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : filter.type === 'date' ? (
                    <Input
                      type="date"
                      value={activeFilters[filter.id] || ''}
                      onChange={(e) => onFilterChange(filter.id, e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white h-9"
                    />
                  ) : (
                    <Input
                      type={filter.type || 'text'}
                      value={activeFilters[filter.id] || ''}
                      onChange={(e) => onFilterChange(filter.id, e.target.value)}
                      placeholder={filter.placeholder}
                      className="bg-slate-800/50 border-slate-700 text-white h-9"
                    />
                  )}
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}