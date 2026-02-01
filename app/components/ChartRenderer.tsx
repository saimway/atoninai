"use client";

import { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface ChartRendererProps {
  code: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f'];

export function ChartRenderer({ code }: ChartRendererProps) {
  const config = useMemo(() => {
    try {
      return JSON.parse(code);
    } catch (e) {
      console.error("Failed to parse chart config", e);
      return null;
    }
  }, [code]);

  if (!config) {
    return (
      <div className="p-4 text-red-500 bg-red-500/10 rounded-lg text-sm">
        Invalid chart configuration.
      </div>
    );
  }

  const { type, data, title, xAxisKey, series } = config;

  if (!data || !Array.isArray(data)) {
    return (
        <div className="p-4 text-red-500 bg-red-500/10 rounded-lg text-sm">
            Missing data array.
        </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
            <XAxis
                dataKey={xAxisKey}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke="#71717a"
            />
            <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke="#71717a"
            />
            <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                itemStyle={{ color: '#e4e4e7' }}
                cursor={{ fill: '#27272a', opacity: 0.4 }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            {series?.map((s: any, i: number) => (
              <Bar
                key={s.dataKey || i}
                dataKey={s.dataKey}
                name={s.name || s.dataKey}
                fill={s.color || COLORS[i % COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
            <XAxis
                dataKey={xAxisKey}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke="#71717a"
            />
            <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke="#71717a"
            />
             <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                itemStyle={{ color: '#e4e4e7' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            {series?.map((s: any, i: number) => (
              <Line
                key={s.dataKey || i}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name || s.dataKey}
                stroke={s.color || COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4, fill: '#18181b', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
            <XAxis
                dataKey={xAxisKey}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke="#71717a"
            />
            <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke="#71717a"
            />
             <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                itemStyle={{ color: '#e4e4e7' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            {series?.map((s: any, i: number) => (
              <Area
                key={s.dataKey || i}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name || s.dataKey}
                stroke={s.color || COLORS[i % COLORS.length]}
                fill={s.color || COLORS[i % COLORS.length]}
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        );
      case 'pie':
          const pieSeries = series?.[0]; // Pie usually has one series with value key
          if (!pieSeries) return (
             <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                 Missing series configuration for Pie chart
             </div>
          );
          return (
             <PieChart>
                 <Pie
                    data={data}
                    dataKey={pieSeries.dataKey}
                    nameKey={xAxisKey || 'name'}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#52525b' }}
                 >
                    {data.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                 </Pie>
                 <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    itemStyle={{ color: '#e4e4e7' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
             </PieChart>
          )
      default:
        return (
            <div className="p-4 text-yellow-500 bg-yellow-500/10 rounded-lg text-sm">
                Unsupported chart type: {type}
            </div>
        );
    }
  };

  return (
    <div className="w-full h-[350px] bg-zinc-950 rounded-lg p-6 border border-zinc-800 flex flex-col">
        {title && <h3 className="text-center text-sm font-semibold mb-6 text-zinc-200">{title}</h3>}
        <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
                {renderChart() || <div>Error rendering chart</div>}
            </ResponsiveContainer>
        </div>
    </div>
  );
}
