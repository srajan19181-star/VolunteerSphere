import React from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-secondary/95 border border-white/10 rounded-xl px-4 py-3 text-sm font-body shadow-xl">
        <p className="text-white/50 mb-1">{payload[0]?.payload?.skill}</p>
        <p className="text-accent-cyan font-semibold">{payload[0]?.value} volunteers</p>
      </div>
    );
  }
  return null;
};

const SkillsRadar = ({ volunteers = [] }) => {
  const allSkills = ['Teaching', 'Medical', 'Tech', 'Cooking', 'Driving', 'Counseling', 'Fundraising'];
  const data = allSkills.map((skill) => ({
    skill,
    count: volunteers.filter((v) => v.skills?.includes(skill)).length,
    fullMark: Math.max(volunteers.length, 1),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis dataKey="skill" tick={{ fill: '#94A3B8', fontSize: 10 }} />
        <Tooltip content={<CustomTooltip />} />
        <Radar
          name="Volunteers"
          dataKey="count"
          stroke="#06B6D4"
          fill="#06B6D4"
          fillOpacity={0.2}
          strokeWidth={2}
          dot={{ fill: '#06B6D4', r: 3, strokeWidth: 0 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default SkillsRadar;
