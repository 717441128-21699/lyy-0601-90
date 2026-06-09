import { create } from 'zustand';
import type { WeightRecord } from '@/types';
import { mockWeightRecords } from '@/mock/data';
import { storage, generateId } from '@/utils/storage';
import { getToday, getTodayISO, generateDaysArray } from '@/utils/date';
import { useNotificationStore } from '@/store/useNotificationStore';

interface BodyState {
  records: WeightRecord[];
  addRecord: (data: Omit<WeightRecord, 'id' | 'userId' | 'createdAt'>) => WeightRecord;
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
  
  addRecord: (data) => {
    const newRecord: WeightRecord = {
      ...data,
      id: generateId('weight'),
      userId: 'user-001',
      createdAt: getTodayISO(),
    };
    
    set((state) => {
      const updated = [newRecord, ...state.records];
      storage.set('weightRecords', updated);
      return { records: updated };
    });
    
    const { addNotification } = useNotificationStore.getState();
    
    if (get().records.length >= 2) {
      const prevRecord = get().records[1];
      const weightDiff = Math.round((prevRecord.weight - data.weight) * 10) / 10;
      
      if (weightDiff > 0) {
        addNotification({
          type: 'system',
          title: '🎉 体重下降啦',
          content: `恭喜！您的体重较上次下降了 ${weightDiff} kg，继续保持良好的饮食和运动习惯！`,
          relatedRecordId: newRecord.id,
        });
      } else if (weightDiff < 0) {
        addNotification({
          type: 'reminder',
          title: '📊 体重有所上升',
          content: `您的体重较上次上升了 ${Math.abs(weightDiff)} kg，建议回顾近期饮食和运动情况，有疑问可咨询营养师。`,
          relatedRecordId: newRecord.id,
        });
      } else {
        addNotification({
          type: 'system',
          title: '⚖️ 体重记录完成',
          content: `您的体重为 ${data.weight} kg，与上次记录持平，继续保持！`,
          relatedRecordId: newRecord.id,
        });
      }
    } else {
      addNotification({
        type: 'system',
        title: '⚖️ 首次体重记录',
        content: `恭喜您完成首次体重记录 ${data.weight} kg，开始您的健康减重之旅吧！`,
        relatedRecordId: newRecord.id,
      });
    }
    
    return newRecord;
  },
  
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
