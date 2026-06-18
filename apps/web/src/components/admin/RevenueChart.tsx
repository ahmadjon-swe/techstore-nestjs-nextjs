'use client';

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import type { AdminOrder } from '@/lib/admin-api';
import { formatPrice } from '@/lib/utils';

/** 7-day revenue area chart, derived client-side from the orders list. */
export function RevenueChart({ orders }: { orders: AdminOrder[] }) {
  const data = useMemo(() => {
    const days: { label: string; key: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        key: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString('en', { weekday: 'short' }),
        revenue: 0,
      });
    }
    const byKey = new Map(days.map((d) => [d.key, d]));
    for (const o of orders) {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      const bucket = byKey.get(key);
      if (bucket) bucket.revenue += Number(o.totalUzs) / 1_000_000; // millions UZS
    }
    return days;
  }, [orders]);

  return (
    <div className="rounded-2xl border border-line bg-surface/60 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Revenue · last 7 days</h2>
        <span className="font-mono text-xs text-faint">млн so'm</span>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6e8bff" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#34e3e8" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1d212e" vertical={false} />
            <XAxis dataKey="label" stroke="#5b6273" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#5b6273" fontSize={12} tickLine={false} axisLine={false} width={40} />
            <Tooltip
              contentStyle={{
                background: 'rgba(13,15,23,0.95)',
                border: '1px solid #1d212e',
                borderRadius: 12,
                color: '#eef1f7',
              }}
              formatter={(value) => [
                formatPrice(String(Math.round(Number(value) * 1_000_000))),
                'Revenue',
              ]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6e8bff"
              strokeWidth={2}
              fill="url(#rev)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
