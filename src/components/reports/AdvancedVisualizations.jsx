import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grid3X3, Table, Thermometer, BarChart3 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Heatmap Component
export function HeatmapVisualization({ data, xLabels, yLabels, title }) {
  const getColor = (value, max) => {
    const intensity = Math.round((value / max) * 255);
    return `rgb(${255 - intensity}, ${intensity}, 100)`;
  };

  const maxValue = Math.max(...(data?.flat() || [1]));

  return (
    <Card className="bg-slate-800/30 border-slate-700/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-orange-400" />
          {title || 'خريطة حرارية'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-1"></th>
                {xLabels?.map((label, i) => (
                  <th key={i} className="p-1 text-slate-400 text-xs font-normal">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.map((row, i) => (
                <tr key={i}>
                  <td className="p-1 text-slate-400 text-xs">{yLabels?.[i]}</td>
                  {row?.map((value, j) => (
                    <td key={j} className="p-1">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: getColor(value, maxValue), color: value > maxValue / 2 ? '#fff' : '#000' }}
                      >
                        {value}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-slate-400 text-xs">منخفض</span>
          <div className="w-24 h-2 rounded" style={{ background: 'linear-gradient(to right, #ff6464, #64ff64)' }} />
          <span className="text-slate-400 text-xs">مرتفع</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Pivot Table Component
export function PivotTableVisualization({ data, rowField, colField, valueField, title }) {
  const [sortConfig, setSortConfig] = useState({ field: null, direction: 'asc' });

  // Process data for pivot
  const pivotData = React.useMemo(() => {
    if (!data || !rowField || !colField || !valueField) return { rows: [], cols: [], values: {} };

    const rows = [...new Set(data.map(d => d[rowField]))];
    const cols = [...new Set(data.map(d => d[colField]))];
    const values = {};

    data.forEach(d => {
      const key = `${d[rowField]}_${d[colField]}`;
      values[key] = (values[key] || 0) + (d[valueField] || 0);
    });

    return { rows, cols, values };
  }, [data, rowField, colField, valueField]);

  const getRowTotal = (row) => {
    return pivotData.cols.reduce((sum, col) => sum + (pivotData.values[`${row}_${col}`] || 0), 0);
  };

  const getColTotal = (col) => {
    return pivotData.rows.reduce((sum, row) => sum + (pivotData.values[`${row}_${col}`] || 0), 0);
  };

  return (
    <Card className="bg-slate-800/30 border-slate-700/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-purple-400" />
          {title || 'جدول محوري'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-900">
              <tr>
                <th className="p-2 text-right text-slate-400 border-b border-slate-700">{rowField}</th>
                {pivotData.cols.map(col => (
                  <th key={col} className="p-2 text-center text-slate-400 border-b border-slate-700">{col}</th>
                ))}
                <th className="p-2 text-center text-cyan-400 border-b border-slate-700">المجموع</th>
              </tr>
            </thead>
            <tbody>
              {pivotData.rows.map(row => (
                <tr key={row} className="hover:bg-slate-800/50">
                  <td className="p-2 text-white font-medium border-b border-slate-800">{row}</td>
                  {pivotData.cols.map(col => (
                    <td key={col} className="p-2 text-center text-slate-300 border-b border-slate-800">
                      {pivotData.values[`${row}_${col}`] || 0}
                    </td>
                  ))}
                  <td className="p-2 text-center text-cyan-400 font-bold border-b border-slate-800">
                    {getRowTotal(row)}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-900/50">
                <td className="p-2 text-cyan-400 font-bold">المجموع</td>
                {pivotData.cols.map(col => (
                  <td key={col} className="p-2 text-center text-cyan-400 font-bold">{getColTotal(col)}</td>
                ))}
                <td className="p-2 text-center text-green-400 font-bold">
                  {pivotData.rows.reduce((sum, row) => sum + getRowTotal(row), 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Advanced Data Table
export function AdvancedDataTable({ data, columns, title }) {
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [filter, setFilter] = useState('');

  const sortedData = React.useMemo(() => {
    if (!data) return [];
    let filtered = filter 
      ? data.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(filter.toLowerCase())))
      : data;
    
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        const dir = sortDir === 'asc' ? 1 : -1;
        return aVal > bVal ? dir : -dir;
      });
    }
    return filtered;
  }, [data, sortField, sortDir, filter]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  return (
    <Card className="bg-slate-800/30 border-slate-700/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Table className="w-4 h-4 text-green-400" />
            {title || 'جدول البيانات'}
          </CardTitle>
          <input
            type="text"
            placeholder="بحث..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs w-32"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-slate-900">
              <tr>
                {columns?.map(col => (
                  <th
                    key={col.field}
                    className="p-2 text-right text-slate-400 border-b border-slate-700 cursor-pointer hover:text-white"
                    onClick={() => handleSort(col.field)}
                  >
                    {col.label}
                    {sortField === col.field && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.slice(0, 50).map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/50">
                  {columns?.map(col => (
                    <td key={col.field} className="p-2 text-slate-300 border-b border-slate-800">
                      {row[col.field]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
        <p className="text-slate-500 text-xs mt-2">عرض {Math.min(sortedData.length, 50)} من {sortedData.length}</p>
      </CardContent>
    </Card>
  );
}

export default function AdvancedVisualizations({ type, data, config }) {
  if (type === 'heatmap') {
    return <HeatmapVisualization {...config} data={data} />;
  }
  if (type === 'pivot') {
    return <PivotTableVisualization {...config} data={data} />;
  }
  if (type === 'table') {
    return <AdvancedDataTable {...config} data={data} />;
  }
  return null;
}