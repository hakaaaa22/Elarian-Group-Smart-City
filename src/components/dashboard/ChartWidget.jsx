import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown } from 'lucide-react';

const timeRanges = [
  { label: '1H', value: 'hour' },
  { label: '24H', value: 'day' },
  { label: '7D', value: 'week' },
  { label: '30D', value: 'month' },
];

const generateData = (range, type) => {
  const points = range === 'hour' ? 12 : range === 'day' ? 24 : range === 'week' ? 7 : 30;
  const labels = range === 'hour' 
    ? Array.from({ length: points }, (_, i) => `${i * 5}m`)
    : range === 'day'
    ? Array.from({ length: points }, (_, i) => `${i}:00`)
    : range === 'week'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : Array.from({ length: points }, (_, i) => `Day ${i + 1}`);

  return labels.map((label, i) => {
    const baseValue = type === 'people' ? 1200 : type === 'traffic' ? 2.5 : 450;
    const variance = type === 'people' ? 400 : type === 'traffic' ? 1.5 : 100;
    return {
      name: label,
      value: Math.round((baseValue + Math.sin(i * 0.5) * variance + Math.random() * variance * 0.5) * 10) / 10,
      prev: Math.round((baseValue + Math.sin(i * 0.5 - 1) * variance * 0.8 + Math.random() * variance * 0.3) * 10) / 10,
    };
  });
};

const metricLabels = {
  speed: 'Avg Speed (mph)',
  volume: 'Volume (vehicles)',
  index: 'Congestion Index',
  incidents: 'Incidents',
};

export default function ChartWidget({ type, title, icon: Icon, color, config = {} }) {
  const [timeRange, setTimeRange] = useState('day');
  const metrics = config.metrics || ['index', 'volume'];
  const showComparison = config.showComparison !== false;
  const data = generateData(timeRange, type);
  
  const currentValue = data[data.length - 1]?.value || 0;
  const prevValue = data[0]?.value || 0;
  const change = ((currentValue - prevValue) / prevValue * 100).toFixed(1);
  const isPositive = change >= 0;

  const colorMap = {
    cyan: { stroke: '#22d3ee', fill: 'rgba(34, 211, 238, 0.2)', gradient: 'cyan' },
    green: { stroke: '#22c55e', fill: 'rgba(34, 197, 94, 0.2)', gradient: 'green' },
    purple: { stroke: '#a855f7', fill: 'rgba(168, 85, 247, 0.2)', gradient: 'purple' },
    amber: { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.2)', gradient: 'amber' },
  };

  const chartColor = colorMap[color] || colorMap.cyan;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`w-5 h-5 text-${color}-400`} />}
          <span className="text-white font-medium">{title}</span>
        </div>
        <div className="flex gap-1">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              variant="ghost"
              size="sm"
              onClick={() => setTimeRange(range.value)}
              className={`h-6 px-2 text-xs ${
                timeRange === range.value
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <span className="text-2xl font-bold text-white">
          {type === 'traffic' ? currentValue.toFixed(1) : currentValue.toLocaleString()}
        </span>
        {showComparison && (
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {isPositive ? '+' : ''}{change}%
          </div>
        )}
        {type === 'traffic' && metrics.length > 0 && (
          <div className="flex gap-1 ml-auto flex-wrap">
            {metrics.map(m => (
              <span key={m} className="text-xs px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">
                {metricLabels[m]?.split(' ')[0] || m}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor.stroke} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColor.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.1)" />
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartColor.stroke}
              fill={`url(#gradient-${type})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}