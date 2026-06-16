import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-secondary/95 border border-white/10 rounded-xl px-4 py-3 text-sm font-body shadow-xl">
        <p className="text-white/50 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="font-semibold">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const VolunteerChart = ({ data }) => {
  // data: [{ _id: { year, month }, count }]
  const chartData = MONTHS.map((month, i) => {
    const found = data?.find((d) => d._id.month === i + 1);
    return { month, volunteers: found?.count || 0 };
  });

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="volunteers"
          stroke="#7C3AED"
          strokeWidth={2}
          fill="url(#volGradient)"
          dot={{ fill: '#7C3AED', strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, fill: '#7C3AED', strokeWidth: 0 }}
          name="Volunteers"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default VolunteerChart;
