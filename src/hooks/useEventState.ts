import { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialBudgetItems, initialCashEntries, initialChecklist } from '../seed';
import { BudgetItem, CashEntry, ChecklistItem } from '../types';
import { recommendPurchases, remaining } from '../logic';

const STORAGE_KEY = '@nosso-evento/state-v2';
const LEGACY_STORAGE_KEY = '@nosso-evento/state-v1';

type PersistedState = {
  items: BudgetItem[];
  cashEntries: CashEntry[];
  checklist: ChecklistItem[];
};

function applySavedState(
  saved: Partial<PersistedState>,
  setters: {
    setItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
    setCashEntries: React.Dispatch<React.SetStateAction<CashEntry[]>>;
    setChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  },
) {
  setters.setItems(saved.items ?? initialBudgetItems);
  setters.setCashEntries(saved.cashEntries ?? initialCashEntries);
  setters.setChecklist(saved.checklist ?? initialChecklist);
}

export function useEventState() {
  const [items, setItems] = useState<BudgetItem[]>(initialBudgetItems);
  const [cashEntries, setCashEntries] = useState<CashEntry[]>(initialCashEntries);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const currentRaw = await AsyncStorage.getItem(STORAGE_KEY);
        const legacyRaw = currentRaw ? null : await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
        const raw = currentRaw ?? legacyRaw;

        if (raw) {
          const saved = JSON.parse(raw) as Partial<PersistedState>;
          applySavedState(saved, { setItems, setCashEntries, setChecklist });

          if (!currentRaw && legacyRaw) {
            await AsyncStorage.setItem(STORAGE_KEY, legacyRaw);
          }
        }
      } catch (error) {
        console.warn('Falha ao carregar dados do evento', error);
      } finally {
        setHydrated(true);
      }
    };

    hydrate();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const state: PersistedState = { items, cashEntries, checklist };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(error =>
      console.warn('Falha ao guardar dados do evento', error),
    );
  }, [hydrated, items, cashEntries, checklist]);

  const totals = useMemo(() => {
    const estimated = items.reduce((sum, item) => sum + item.estimated, 0);
    const paid = items.reduce((sum, item) => sum + item.paid, 0);
    const pending = items.reduce((sum, item) => sum + remaining(item), 0);
    const cash = cashEntries.reduce(
      (sum, entry) => sum + (entry.type === 'entrada' ? entry.amount : -entry.amount),
      0,
    );
    return { estimated, paid, pending, cash };
  }, [items, cashEntries]);

  const recommendation = useMemo(
    () => recommendPurchases(items, totals.cash),
    [items, totals.cash],
  );

  const registerPayment = (item: BudgetItem, value: number) => {
    if (value <= 0) return;
    const actual = Math.min(value, remaining(item));
    if (actual <= 0) return;

    setItems(current =>
      current.map(currentItem =>
        currentItem.id === item.id
          ? {
              ...currentItem,
              paid: currentItem.paid + actual,
              status:
                currentItem.paid + actual >= currentItem.estimated
                  ? 'concluido'
                  : 'parcial',
            }
          : currentItem,
      ),
    );

    setCashEntries(current => [
      {
        id: `${Date.now()}`,
        type: 'saida',
        amount: actual,
        description: item.name,
        date: new Date().toISOString().slice(0, 10),
      },
      ...current,
    ]);
  };

  const addCashEntry = (entry: Omit<CashEntry, 'id' | 'date'>) => {
    setCashEntries(current => [
      {
        ...entry,
        id: `${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
      },
      ...current,
    ]);
  };

  const toggleChecklist = (id: string) => {
    setChecklist(current =>
      current.map(item => (item.id === id ? { ...item, done: !item.done } : item)),
    );
  };

  return {
    items,
    cashEntries,
    checklist,
    totals,
    recommendation,
    registerPayment,
    addCashEntry,
    toggleChecklist,
  };
}
