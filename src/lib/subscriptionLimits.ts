import { PlanId } from '@/types/subscription';

export const PLAN_LIMITS = {
  free: {
    maxCalculations: 3,
    canExportExcel: false,
    canExportPdf: true,
    advancedCharts: false,
  },
  pro: {
    maxCalculations: Infinity,
    canExportExcel: true,
    canExportPdf: true,
    advancedCharts: true,
  },
  business: {
    maxCalculations: Infinity,
    canExportExcel: true,
    canExportPdf: true,
    advancedCharts: true,
  },
} as const;

export const getPlanLimits = (plan: PlanId) => PLAN_LIMITS[plan] || PLAN_LIMITS.free;

export const canSaveMoreCalculations = (plan: PlanId, currentCount: number): boolean => {
  const limits = getPlanLimits(plan);
  return currentCount < limits.maxCalculations;
};

export const getRemainingCalculations = (plan: PlanId, currentCount: number): number => {
  const limits = getPlanLimits(plan);
  if (limits.maxCalculations === Infinity) return Infinity;
  return Math.max(0, limits.maxCalculations - currentCount);
};
