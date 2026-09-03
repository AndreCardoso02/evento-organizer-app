export type Priority = 'alta' | 'media' | 'baixa';
export type ItemStatus = 'pendente' | 'parcial' | 'concluido';
export type Category = 'Salao' | 'Comida' | 'Bebidas' | 'Roupa' | 'Aliancas' | 'Doces' | 'Salgados' | 'Cozinha' | 'Outros';

export type BudgetItem = {
  id: string;
  name: string;
  category: Category;
  estimated: number;
  paid: number;
  priority: Priority;
  status: ItemStatus;
  deadline?: string;
  nonPerishable?: boolean;
};

export type CashEntry = {
  id: string;
  type: 'entrada' | 'saida';
  amount: number;
  description: string;
  date: string;
};

export type ChecklistItem = {
  id: string;
  title: string;
  done: boolean;
};
