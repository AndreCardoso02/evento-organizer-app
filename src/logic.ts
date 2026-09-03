import { BudgetItem } from './types';
import { RESERVE_RATE } from './seed';

export const money = (value: number) => new Intl.NumberFormat('pt-AO', {
  style: 'currency', currency: 'AOA', maximumFractionDigits: 0
}).format(value).replace('AOA', 'Kz');

export const remaining = (item: BudgetItem) => Math.max(0, item.estimated - item.paid);

export function recommendPurchases(items: BudgetItem[], cash: number) {
  const spendable = Math.max(0, Math.floor(cash * (1 - RESERVE_RATE)));
  const priorityWeight = { alta: 3, media: 2, baixa: 1 } as const;

  const candidates = items
    .filter(i => i.status !== 'concluido' && remaining(i) > 0)
    .map(i => ({
      item: i,
      cost: remaining(i),
      score: priorityWeight[i.priority] * 100 + (i.nonPerishable ? 25 : 0) - Math.min(99, remaining(i) / 10_000)
    }))
    .sort((a, b) => b.score - a.score);

  const selected: { item: BudgetItem; suggested: number }[] = [];
  let used = 0;

  for (const c of candidates) {
    const left = spendable - used;
    if (left <= 0) break;
    const suggested = Math.min(c.cost, left);
    if (suggested >= Math.min(5_000, c.cost)) {
      selected.push({ item: c.item, suggested });
      used += suggested;
    }
  }

  return { spendable, used, reserve: cash - spendable, selected };
}
