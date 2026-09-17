import { DailyPlanItem, PlanConfig } from '../types';

export function formatMT(value: number): string {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const formatted = new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absValue);
  return `${isNegative ? '-' : ''}MT ${formatted}`;
}

// Alias for backward compatibility
export const formatBRL = formatMT;
export const formatCurrency = formatMT;

export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function generateDailyPlan(config: PlanConfig, existingItems: DailyPlanItem[] = []): DailyPlanItem[] {
  const items: DailyPlanItem[] = [];
  const start = new Date(config.startDate + 'T00:00:00');
  let currentBase = config.initialBalance;

  let accumulatedWin = 0;
  let accumulatedLoss = 0;

  for (let i = 1; i <= config.durationDays; i++) {
    const dayDate = new Date(start);
    dayDate.setDate(dayDate.getDate() + (i - 1));
    const dateStr = formatDateISO(dayDate);

    const targetProfit = currentBase * (config.dailyProfitPercent / 100);
    const targetBalance = currentBase + targetProfit;
    const stopLossAmount = currentBase * (config.stopLossPercent / 100);
    const stopLossBalance = Math.max(0, currentBase - stopLossAmount);

    const existing = existingItems.find((item) => item.dayNumber === i);

    let status = existing ? existing.status : 'pendente';
    let actualProfit = existing ? existing.actualProfit : 0;
    const notes = existing?.notes;

    if (status === 'win') {
      accumulatedWin += actualProfit !== 0 ? actualProfit : targetProfit;
    } else if (status === 'loss') {
      accumulatedLoss += actualProfit !== 0 ? Math.abs(actualProfit) : stopLossAmount;
    }

    items.push({
      dayNumber: i,
      date: dateStr,
      startBalance: currentBase,
      targetProfit,
      targetBalance,
      stopLossAmount,
      stopLossBalance,
      status,
      actualProfit,
      accumulatedProfit: accumulatedWin,
      accumulatedLoss: accumulatedLoss,
      notes,
    });

    // Next day base projected on target compound
    currentBase = targetBalance;
  }

  return items;
}
