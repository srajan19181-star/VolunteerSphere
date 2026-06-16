import React from 'react';
import SkeletonBase from './SkeletonBase';

export const StatCardSkeleton = () => (
  <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
    <div className="flex items-center justify-between">
      <SkeletonBase className="h-4 w-24 rounded-full" />
      <SkeletonBase className="h-9 w-9 rounded-xl" />
    </div>
    <SkeletonBase className="h-9 w-32 rounded-lg" />
    <SkeletonBase className="h-3 w-20 rounded-full" />
  </div>
);

export const EventCardSkeleton = () => (
  <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
    <SkeletonBase className="h-5 w-20 rounded-full" />
    <SkeletonBase className="h-6 w-3/4 rounded-lg" />
    <SkeletonBase className="h-4 w-full rounded-md" />
    <SkeletonBase className="h-4 w-5/6 rounded-md" />
    <div className="flex gap-4 pt-1">
      <SkeletonBase className="h-3 w-24 rounded-full" />
      <SkeletonBase className="h-3 w-20 rounded-full" />
    </div>
    <SkeletonBase className="h-2 w-full rounded-full" />
    <SkeletonBase className="h-10 w-full rounded-xl" />
  </div>
);

export const EventsGridSkeleton = () => (
  <div>
    <div className="flex gap-3 mb-8">
      <SkeletonBase className="h-11 flex-1 rounded-xl" />
      {[...Array(4)].map((_, i) => (
        <SkeletonBase key={i} className="h-11 w-24 rounded-full" />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => <EventCardSkeleton key={i} />)}
    </div>
  </div>
);

export const ActivityFeedSkeleton = ({ items = 6 }) => (
  <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
    <SkeletonBase className="h-5 w-40 rounded-lg" />
    {[...Array(items)].map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <SkeletonBase className="h-10 w-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBase className="h-4 w-3/4 rounded-md" />
          <SkeletonBase className="h-3 w-1/3 rounded-full" />
        </div>
        <SkeletonBase className="h-6 w-14 rounded-full" />
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 8, columns = 6 }) => (
  <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
    <div className="flex gap-4 px-6 py-4 border-b border-white/10">
      {[...Array(columns)].map((_, i) => (
        <SkeletonBase key={i} className="h-3 flex-1 rounded-full" />
      ))}
    </div>
    {[...Array(rows)].map((_, rowIdx) => (
      <div key={rowIdx} className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
        <SkeletonBase className="h-9 w-9 rounded-full flex-shrink-0" />
        {[...Array(columns - 1)].map((_, colIdx) => (
          <SkeletonBase key={colIdx} className={`h-3 flex-1 rounded-full ${colIdx % 3 === 0 ? 'max-w-[80px]' : ''}`} />
        ))}
      </div>
    ))}
    <div className="flex justify-between items-center px-6 py-4">
      <SkeletonBase className="h-3 w-32 rounded-full" />
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <SkeletonBase key={i} className="h-8 w-8 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-8 p-6">
    <div className="space-y-2">
      <SkeletonBase className="h-8 w-64 rounded-lg" />
      <SkeletonBase className="h-4 w-40 rounded-full" />
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
        <SkeletonBase className="h-5 w-40 rounded-lg" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5">
            <SkeletonBase className="h-12 w-12 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonBase className="h-4 w-3/4 rounded-md" />
              <SkeletonBase className="h-3 w-1/2 rounded-full" />
            </div>
            <SkeletonBase className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-6">
        <SkeletonBase className="h-5 w-32 rounded-lg" />
        <SkeletonBase className="h-44 w-44 rounded-full mx-auto" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <SkeletonBase className="h-3 w-24 rounded-full" />
              <SkeletonBase className="h-3 w-10 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
    <ActivityFeedSkeleton items={5} />
  </div>
);

export const AdminDashboardSkeleton = () => (
  <div className="space-y-8 p-6">
    <SkeletonBase className="h-8 w-48 rounded-lg" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
    </div>
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
      <div className="flex justify-between items-center">
        <SkeletonBase className="h-5 w-52 rounded-lg" />
        <SkeletonBase className="h-8 w-28 rounded-lg" />
      </div>
      <SkeletonBase className="h-64 w-full rounded-xl" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
          <SkeletonBase className="h-5 w-40 rounded-lg" />
          <SkeletonBase className="h-48 w-full rounded-xl" />
        </div>
      ))}
    </div>
    <ActivityFeedSkeleton />
  </div>
);

export const ProfileSkeleton = () => (
  <div className="max-w-3xl mx-auto space-y-8 p-6">
    <div className="flex items-center gap-6">
      <SkeletonBase className="h-24 w-24 rounded-full" />
      <div className="space-y-3">
        <SkeletonBase className="h-7 w-48 rounded-lg" />
        <SkeletonBase className="h-4 w-32 rounded-full" />
        <SkeletonBase className="h-8 w-28 rounded-xl" />
      </div>
    </div>
    {[...Array(3)].map((_, sectionIdx) => (
      <div key={sectionIdx} className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-5">
        <SkeletonBase className="h-5 w-36 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonBase className="h-3 w-20 rounded-full" />
              <SkeletonBase className="h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    ))}
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
      <SkeletonBase className="h-5 w-28 rounded-lg" />
      <div className="flex flex-wrap gap-2">
        {[80, 100, 70, 110, 90].map((w, i) => (
          <div key={i} className="h-8 rounded-full bg-white/5 overflow-hidden relative" style={{ width: w }}>
            <SkeletonBase className="h-full w-full" />
          </div>
        ))}
      </div>
    </div>
    <div className="flex justify-end">
      <SkeletonBase className="h-12 w-36 rounded-xl" />
    </div>
  </div>
);

export const ReportSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
          <SkeletonBase className="h-10 w-10 rounded-xl" />
          <SkeletonBase className="h-4 w-28 rounded-md" />
          <SkeletonBase className="h-3 w-full rounded-full" />
          <SkeletonBase className="h-3 w-4/5 rounded-full" />
        </div>
      ))}
    </div>
    <div className="flex gap-3">
      <SkeletonBase className="h-11 w-44 rounded-xl" />
      <SkeletonBase className="h-11 w-44 rounded-xl" />
      <SkeletonBase className="h-11 w-32 rounded-xl ml-auto" />
      <SkeletonBase className="h-11 w-32 rounded-xl" />
    </div>
    <TableSkeleton rows={6} columns={5} />
  </div>
);
