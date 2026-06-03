import React from 'react';
import { SparklineStatCard } from '../dashboard/SparklineStatCard';

export default { title: 'UI/SparklineStatCard', component: SparklineStatCard };

/* ── Basic Variants ───────────────────────────────────── */

const upTrend = [20, 35, 28, 42, 38, 55, 48, 62, 58, 72, 68, 85];
const downTrend = [80, 72, 75, 65, 58, 62, 50, 45, 48, 38, 32, 28];
const volatileTrend = [30, 60, 25, 55, 35, 65, 28, 58, 32, 62, 30, 60];

export const Default = () => (
  <SparklineStatCard
    label="Open Rate"
    value="24.3%"
    trend="up"
    trendLabel="+4.2% this week"
  />
);

export const WithSparkline = () => (
  <SparklineStatCard
    label="Open Rate"
    value="24.3%"
    trend="up"
    trendLabel="+4.2% this week"
    sparklineData={upTrend}
  />
);

export const DownTrend = () => (
  <SparklineStatCard
    label="Bounce Rate"
    value="3.1%"
    trend="down"
    trendLabel="-0.8% this week"
    sparklineData={downTrend}
  />
);

export const NeutralTrend = () => (
  <SparklineStatCard
    label="Total Sent"
    value="12,847"
    trend="neutral"
    trendLabel="Stable"
  />
);

export const WithBadge = () => (
  <SparklineStatCard
    label="Reply Rate"
    value="8.7%"
    trend="up"
    trendLabel="+2.1% this week"
    badge={{ text: "★ Top 10%", color: "text-amber-500" }}
    sparklineData={upTrend}
  />
);

export const NearLimit = () => (
  <SparklineStatCard
    label="API Usage"
    value="87%"
    trend="down"
    trendLabel="12% remaining"
    nearLimit
    sparklineData={volatileTrend}
  />
);

export const MetricGrid = () => (
  <div className="grid grid-cols-2 gap-3 max-w-2xl">
    <SparklineStatCard
      label="Open Rate"
      value="24.3%"
      trend="up"
      trendLabel="+4.2%"
      sparklineData={upTrend}
    />
    <SparklineStatCard
      label="Bounce Rate"
      value="3.1%"
      trend="down"
      trendLabel="-0.8%"
      sparklineData={downTrend}
    />
    <SparklineStatCard
      label="Reply Rate"
      value="8.7%"
      trend="up"
      trendLabel="+2.1%"
      badge={{ text: "★ Top 10%", color: "text-amber-500" }}
      sparklineData={upTrend}
    />
    <SparklineStatCard
      label="API Usage"
      value="87%"
      trend="down"
      trendLabel="12% remaining"
      nearLimit
      sparklineData={volatileTrend}
    />
  </div>
);

/* ── Dark Mode Variants ───────────────────────────────── */

export const DarkMode = () => (
  <div className="dark bg-neutral-950 p-6 rounded-lg max-w-xs">
    <SparklineStatCard
      label="Open Rate"
      value="24.3%"
      trend="up"
      trendLabel="+4.2% this week"
      sparklineData={upTrend}
    />
  </div>
);

export const DarkModeGrid = () => (
  <div className="dark bg-neutral-950 p-6 rounded-lg">
    <div className="grid grid-cols-2 gap-3 max-w-2xl">
      <SparklineStatCard label="Sent" value="12,847" trend="up" trendLabel="+847" sparklineData={upTrend} />
      <SparklineStatCard label="Opens" value="3,124" trend="up" trendLabel="+12%" sparklineData={upTrend} />
      <SparklineStatCard label="Bounces" value="398" trend="down" trendLabel="-5%" sparklineData={downTrend} />
      <SparklineStatCard label="Replies" value="1,089" trend="up" trendLabel="+8.7%" sparklineData={upTrend} />
    </div>
  </div>
);

/* ── Custom className Variants ────────────────────────── */

export const CustomWidth = () => (
  <SparklineStatCard
    label="Total Revenue"
    value="$48,290"
    trend="up"
    trendLabel="+12.5% this quarter"
    sparklineData={upTrend}
    className="max-w-xs"
  />
);
