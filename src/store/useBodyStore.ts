import { create } from 'zustand';
import type { WeightRecord } from '@/types';
import { mockWeightRecords } from '@/mock/data';
import { storage, generateId } from '@/utils/storage';
import { getToday, getTodayISO, generateDaysArray } from '@/utils/date';

interface BodyState {
  records: WeightRecord[];
  addRecord: (data: Omit<WeightRecord, 'id' | 'userId' | 'createdAt'>) => void;
  getLatestRecord: () => WeightRecord | undefined;
  getWeeklyRecords: () => WeightRecord[];
  getMonthlyRecords: () => WeightRecord[];
  getWeightTrend: () => { date: string; weight: number }[];
}

const getInitialRecords = (): WeightRecord[] => {
  const stored = storage.get<WeightRecord[] | null>('weightRecords', null);
  return stored || mockWeightRecords;
};

export const useBodyStore = create<BodyState>((set, get) => ({
  records: getInitialRecords(),
  
  addRecord: (data) => set((state) => {
    const newRecord: WeightRecord = {
      ...data,
      id: generateId('weight'),
      userId: 'user-001',
      createdAt: getTodayISO(),
    };
    const updated = [newRecord, ...state.records];
    storage.set('weightRecords', updated);
    return { records: updated };
  }),
  
  getLatestRecord: () => {
    return get().records[0];
  },
  
  getWeeklyRecords: () => {
    const days = generateDaysArray(7);
    return get().records.filter(r => days.includes(r.date));
  },
  
  getMonthlyRecords: () => {
    const days = generateDaysArray(30);
    return get().records.filter(r => days.includes(r.date));
  },
  
  getWeightTrend: () => {
    const days = generateDaysArray(30);
    const records = get().getMonthlyRecords();
    
    return days.map(date => {
      const record = records.find(r => r.date === date);
      const prevRecords = records.filter(r => r.date <= date);
      const weight = record ? record.weight : 
        prevRecords.length > 0 ? prevRecords[0].weight : 0;
      
      return {
        date,
        weight,
      };
    }).filter(d => d.weight > 0);
  },
}));
