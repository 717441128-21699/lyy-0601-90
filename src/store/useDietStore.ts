import { create } from 'zustand';
import type { DietRecord, ShoppingItem } from '@/types';
import { mockDietRecords, mockShoppingList } from '@/mock/data';
import { storage, generateId } from '@/utils/storage';
import { getToday, getTodayISO } from '@/utils/date';
import { estimateCalorieRange } from '@/utils/calories';

interface DietState {
  records: DietRecord[];
  shoppingList: ShoppingItem[];
  addRecord: (data: Omit<DietRecord, 'id' | 'userId' | 'calorieRange' | 'isHighRisk' | 'createdAt'>) => void;
  toggleShoppingItem: (id: string) => void;
  addShoppingItem: (name: string, quantity: string, category: string) => void;
  removeShoppingItem: (id: string) => void;
  getTodayRecords: () => DietRecord[];
  getRecordsByDate: (date: string) => DietRecord[];
}

const getInitialRecords = (): DietRecord[] => {
  const stored = storage.get<DietRecord[] | null>('dietRecords', null);
  return stored || mockDietRecords;
};

const getInitialShoppingList = (): ShoppingItem[] => {
  const stored = storage.get<ShoppingItem[] | null>('shoppingList', null);
  return stored || mockShoppingList;
};

export const useDietStore = create<DietState>((set, get) => ({
  records: getInitialRecords(),
  shoppingList: getInitialShoppingList(),
  
  addRecord: (data) => set((state) => {
    const newRecord: DietRecord = {
      ...data,
      id: generateId('diet'),
      userId: 'user-001',
      calorieRange: estimateCalorieRange(data.description),
      isHighRisk: false,
      createdAt: getTodayISO(),
    };
    const updated = [newRecord, ...state.records];
    storage.set('dietRecords', updated);
    return { records: updated };
  }),
  
  toggleShoppingItem: (id) => set((state) => {
    const updated = state.shoppingList.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    storage.set('shoppingList', updated);
    return { shoppingList: updated };
  }),
  
  addShoppingItem: (name, quantity, category) => set((state) => {
    const newItem: ShoppingItem = {
      id: generateId('shop'),
      userId: 'user-001',
      name,
      quantity,
      category,
      checked: false,
      addedAt: getToday(),
    };
    const updated = [newItem, ...state.shoppingList];
    storage.set('shoppingList', updated);
    return { shoppingList: updated };
  }),
  
  removeShoppingItem: (id) => set((state) => {
    const updated = state.shoppingList.filter(item => item.id !== id);
    storage.set('shoppingList', updated);
    return { shoppingList: updated };
  }),
  
  getTodayRecords: () => {
    const today = getToday();
    return get().records.filter(r => r.date === today);
  },
  
  getRecordsByDate: (date) => {
    return get().records.filter(r => r.date === date);
  },
}));
