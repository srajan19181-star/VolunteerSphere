import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const COLORS = ['#7C3AED', '#06B6D4', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-secondary/95 border border-white/10 rounded-xl px-4 py-3 text-sm font-body shadow-xl">
        <p className="text-white/50 mb-1">{label}</p>
        <p style={{ color: payload[0]?.fill }} className="font-semibold">Events: {payload[0]?.value}</p>
      </div>
    );
  }
  return null;
};

const EventChart = ({ events = [] }) => {
  // Tally events by category
  const categories = ['Environment', 'Education', 'Health', 'Food', 'Tech', 'Community', 'Disaster Relief'];
  const data = categories.map((cat, i) => ({
    category: cat.split(' ')[0],
    count: events.filter((e) => e.category === cat).length,
    color: COLORS[i],
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="category" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Events">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EventChart;
