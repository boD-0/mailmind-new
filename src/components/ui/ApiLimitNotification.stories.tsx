import React from 'react';
import { ApiLimitNotification } from './api-limit-notification';

export default { title: 'UI/ApiLimitNotification', component: ApiLimitNotification };

/* ── Basic Variants ───────────────────────────────────── */

export const LowUsage = () => (
  <ApiLimitNotification usagePercent={25} planName="Free" />
);

export const WarningAt80 = () => (
  <ApiLimitNotification usagePercent={82} planName="Free" />
);

export const At99Percent = () => (
  <ApiLimitNotification usagePercent={95} planName="Starter" />
);

export const Exceeded = () => (
  <ApiLimitNotification usagePercent={100} planName="Free" isExceeded />
);

export const ProfessionalPlan = () => (
  <ApiLimitNotification usagePercent={45} planName="Professional" />
);

export const ExceededProfessional = () => (
  <ApiLimitNotification usagePercent={100} planName="Professional" isExceeded />
);

export const WithUpgradeHandler = () => (
  <ApiLimitNotification
    usagePercent={88}
    planName="Free"
    onUpgrade={() => alert('Upgrade clicked!')}
    onDismiss={() => alert('Dismissed!')}
  />
);

export const AllStates = () => (
  <div className="flex flex-col gap-4 max-w-md">
    <ApiLimitNotification usagePercent={30} planName="Free" />
    <ApiLimitNotification usagePercent={82} planName="Free" />
    <ApiLimitNotification usagePercent={100} planName="Free" isExceeded />
  </div>
);

/* ── Dark Mode Variants ───────────────────────────────── */

export const DarkModeLowUsage = () => (
  <div className="dark bg-neutral-950 p-6 rounded-lg">
    <ApiLimitNotification usagePercent={25} planName="Free" />
  </div>
);

export const DarkModeExceeded = () => (
  <div className="dark bg-neutral-950 p-6 rounded-lg">
    <ApiLimitNotification usagePercent={100} planName="Free" isExceeded onUpgrade={() => {}} />
  </div>
);
