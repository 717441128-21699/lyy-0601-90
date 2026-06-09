import { create } from 'zustand';
import type { ExerciseRecord, ExerciseType, CheckInDay } from '@/types';
import { mockExerciseRecords, mockExerciseTypes } from '@/mock/data';
import { storage, generateId } from '@/utils/storage';
import { getToday, getTodayISO, generateDaysArray, isToday } from '@/utils/date';
import { calculateExerciseCalories } from '@/utils/calories';

interface ExerciseState {
  records: ExerciseRecord[];
  exerciseTypes: ExerciseType[];
  addRecord: (data: Omit<ExerciseRecord, 'id' | 'userId' | 'calories' | 'createdAt'>) => ExerciseRecord;
  getTodayRecords: () => ExerciseRecord[];
  getRecordsByDate: (date: string) => ExerciseRecord[];
  getWeeklyTotalMinutes: () => number;
  getStreakDays: () => number;
  getCheckInCalendar: () => CheckInDay[];
}

const getInitialRecords = (): ExerciseRecord[] => {
  const stored = storage.get<ExerciseRecord[] | null>('exerciseRecords', null);
  return stored || mockExerciseRecords;
};

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  records: getInitialRecords(),
  exerciseTypes: mockExerciseTypes,
  
  addRecord: (data) => {
    const exerciseType = get().exerciseTypes.find(t => t.id === data.exerciseTypeId);
    const calories = calculateExerciseCalories(exerciseType, data.duration);
    
    const newRecord: ExerciseRecord = {
      ...data,
      id: generateId('exercise'),
      userId: 'user-001',
      calories,
      createdAt: getTodayISO(),
    };
    
    set((state) => {
      const updated = [newRecord, ...state.records];
      storage.set('exerciseRecords', updated);
      return { records: updated };
    });
    
    return newRecord;
  },
  
  getTodayRecords: () => {
    const today = getToday();
    return get().records.filter(r => r.date === today);
  },
  
  getRecordsByDate: (date) => {
    return get().records.filter(r => r.date === date);
  },
  
  getWeeklyTotalMinutes: () => {
    const days = generateDaysArray(7);
    return get().records
      .filter(r => days.includes(r.date))
      .reduce((sum, r) => sum + r.duration, 0);
  },
  
  getStreakDays: () => {
    const records = get().records;
    let streak = 0;
    const today = getToday();
    
    for (let i = 0; i < 365; i++) {
      const date = i === 0 ? today : generateDaysArray(i + 1)[0];
      const hasRecord = records.some(r => r.date === date);
      
      if (hasRecord) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  },
  
  getCheckInCalendar: () => {
    const days = generateDaysArray(30);
    const records = get().records;
    
    return days.map(date => {
      const dayRecords = records.filter(r => r.date === date);
      return {
        date,
        diet: false,
        exercise: dayRecords.length > 0,
        weight: false,
      };
    });
  },
}));
