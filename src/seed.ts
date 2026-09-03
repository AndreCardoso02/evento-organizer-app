import { BudgetItem, CashEntry, ChecklistItem } from './types';

export const EVENT_DATE = '2026-12-19';
export const GUESTS = 150;
export const BUDGET_LIMIT = 2_500_000;
export const RESERVE_RATE = 0.15;

export const initialBudgetItems: BudgetItem[] = [
  { id: 'salao', name: 'Saldo do salao', category: 'Salao', estimated: 1_020_000, paid: 510_000, priority: 'alta', status: 'parcial', deadline: '2026-09-30' },
  { id: 'comida', name: 'Comida principal', category: 'Comida', estimated: 400_000, paid: 0, priority: 'alta', status: 'pendente', deadline: '2026-12-12' },
  { id: 'doces', name: 'Doces', category: 'Doces', estimated: 150_000, paid: 0, priority: 'media', status: 'pendente', deadline: '2026-12-12' },
  { id: 'salgados', name: 'Salgados', category: 'Salgados', estimated: 70_000, paid: 0, priority: 'media', status: 'pendente', deadline: '2026-12-12' },
  { id: 'roupa-andre', name: 'Roupa do noivo', category: 'Roupa', estimated: 100_000, paid: 0, priority: 'media', status: 'pendente', deadline: '2026-10-31' },
  { id: 'roupa-esposa', name: 'Roupa da noiva', category: 'Roupa', estimated: 200_000, paid: 0, priority: 'media', status: 'pendente', deadline: '2026-10-31' },
  { id: 'aliancas', name: 'Aliancas', category: 'Aliancas', estimated: 120_000, paid: 0, priority: 'alta', status: 'pendente', deadline: '2026-10-31', nonPerishable: true },
  { id: 'cerveja', name: 'Cerveja (meta 12 grades)', category: 'Bebidas', estimated: 168_000, paid: 56_000, priority: 'media', status: 'parcial', deadline: '2026-11-30', nonPerishable: true },
  { id: 'outras-bebidas', name: 'Agua, refrigerantes, sumos e gelo', category: 'Bebidas', estimated: 132_000, paid: 0, priority: 'media', status: 'pendente', deadline: '2026-12-15' },
  { id: 'oleo', name: 'Oleo alimentar', category: 'Cozinha', estimated: 35_000, paid: 0, priority: 'alta', status: 'pendente', nonPerishable: true },
  { id: 'acucar', name: 'Acucar', category: 'Cozinha', estimated: 12_000, paid: 0, priority: 'media', status: 'pendente', nonPerishable: true },
  { id: 'sal', name: 'Sal', category: 'Cozinha', estimated: 5_000, paid: 0, priority: 'media', status: 'pendente', nonPerishable: true },
  { id: 'guardanapos', name: 'Guardanapos', category: 'Cozinha', estimated: 8_000, paid: 0, priority: 'media', status: 'pendente', nonPerishable: true },
  { id: 'carvao', name: 'Carvao', category: 'Cozinha', estimated: 10_000, paid: 0, priority: 'media', status: 'pendente', nonPerishable: true },
  { id: 'imprevistos', name: 'Reserva do evento', category: 'Outros', estimated: 50_000, paid: 0, priority: 'alta', status: 'pendente' }
];

export const initialCashEntries: CashEntry[] = [
  { id: 'salario-set', type: 'entrada', amount: 700_000, description: 'Verba do evento - Setembro', date: '2026-09-01' },
  { id: 'salao-pago', type: 'saida', amount: 510_000, description: 'Primeira metade do salao', date: '2026-08-01' },
  { id: 'cerveja-paga', type: 'saida', amount: 56_000, description: '4 grades de cerveja', date: '2026-09-01' }
];

export const initialChecklist: ChecklistItem[] = [
  { id: 'menu', title: 'Definir menu final', done: false },
  { id: 'cozinha', title: 'Confirmar quem vai cozinhar', done: false },
  { id: 'convidados', title: 'Fechar lista de 150 convidados', done: false },
  { id: 'roupa', title: 'Escolher e provar as roupas', done: false },
  { id: 'aliancas', title: 'Escolher as aliancas', done: false },
  { id: 'salao', title: 'Liquidar o saldo do salao', done: false },
  { id: 'bebidas', title: 'Fechar quantidade final de bebidas', done: false }
];
