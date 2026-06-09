import { create } from 'zustand';
import type { Notification, WeeklyReport, ReviewRequest, GroupRanking } from '@/types';
import { mockNotifications, mockWeeklyReports, mockReviewRequests, mockGroupRanking } from '@/mock/data';
import { storage, generateId } from '@/utils/storage';
import { getToday, getTodayISO } from '@/utils/date';
import { useDietStore } from '@/store/useDietStore';
import { useExerciseStore } from '@/store/useExerciseStore';
import { useBodyStore } from '@/store/useBodyStore';

interface NotificationState {
  notifications: Notification[];
  reports: WeeklyReport[];
  reviewRequests: ReviewRequest[];
  rankings: GroupRanking[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  createReviewRequest: (data: Omit<ReviewRequest, 'id' | 'userId' | 'status' | 'createdAt'>) => void;
  addNotification: (data: Omit<Notification, 'id' | 'userId' | 'read' | 'createdAt'>) => Notification;
  getUnreadCount: () => number;
  getNotificationsByType: (type: Notification['type']) => Notification[];
  checkAndSendReminders: () => void;
}

const getInitialNotifications = (): Notification[] => {
  const stored = storage.get<Notification[] | null>('notifications', null);
  return stored || mockNotifications;
};

const getInitialReports = (): WeeklyReport[] => {
  const stored = storage.get<WeeklyReport[] | null>('reports', null);
  return stored || mockWeeklyReports;
};

const getInitialReviewRequests = (): ReviewRequest[] => {
  const stored = storage.get<ReviewRequest[] | null>('reviewRequests', null);
  return stored || mockReviewRequests;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: getInitialNotifications(),
  reports: getInitialReports(),
  reviewRequests: getInitialReviewRequests(),
  rankings: mockGroupRanking,
  
  markAsRead: (id) => set((state) => {
    const updated = state.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    storage.set('notifications', updated);
    return { notifications: updated };
  }),
  
  markAllAsRead: () => set((state) => {
    const updated = state.notifications.map(n => ({ ...n, read: true }));
    storage.set('notifications', updated);
    return { notifications: updated };
  }),
  
  createReviewRequest: (data) => set((state) => {
    const newRequest: ReviewRequest = {
      ...data,
      id: generateId('review'),
      userId: 'user-001',
      status: 'pending',
      createdAt: getTodayISO(),
    };
    const updated = [newRequest, ...state.reviewRequests];
    storage.set('reviewRequests', updated);
    
    const newNotif: Notification = {
      id: generateId('notif'),
      userId: 'user-001',
      type: 'system',
      title: '📅 复盘申请已提交',
      content: `您的一对一复盘申请已提交，营养师将在24小时内确认时间。`,
      relatedRecordId: newRequest.id,
      read: false,
      createdAt: getTodayISO(),
    };
    const updatedNotifs = [newNotif, ...state.notifications];
    storage.set('notifications', updatedNotifs);
    
    return { reviewRequests: updated, notifications: updatedNotifs };
  }),
  
  addNotification: (data) => {
    const newNotif: Notification = {
      ...data,
      id: generateId('notif'),
      userId: 'user-001',
      read: false,
      createdAt: getTodayISO(),
    };
    
    set((state) => {
      const updated = [newNotif, ...state.notifications];
      storage.set('notifications', updated);
      return { notifications: updated };
    });
    
    return newNotif;
  },
  
  getUnreadCount: () => {
    return get().notifications.filter(n => !n.read).length;
  },
  
  getNotificationsByType: (type) => {
    return get().notifications.filter(n => n.type === type);
  },

  checkAndSendReminders: () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 20 && hour < 22) {
      const today = getToday();
      const { getTodayRecords: getTodayDietRecords } = useDietStore.getState();
      const { getTodayRecords: getTodayExerciseRecords } = useExerciseStore.getState();
      const { records: weightRecords } = useBodyStore.getState();
      
      const dietRecords = getTodayDietRecords();
      const exerciseRecords = getTodayExerciseRecords();
      const hasWeightRecord = weightRecords.some(r => r.date === today);
      
      const existingReminders = get().notifications.filter(
        n => n.type === 'reminder' && n.createdAt.startsWith(today)
      );
      
      if (existingReminders.length === 0) {
        const missingItems: string[] = [];
        if (dietRecords.length < 3) {
          const mealTypes = ['早餐', '午餐', '晚餐', '加餐'];
          const recordedMeals = new Set(dietRecords.map(r => r.mealType));
          const mealKeys = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
          const missingMeals = mealTypes.filter((_, i) => !recordedMeals.has(mealKeys[i]));
          if (missingMeals.length > 0) {
            missingItems.push(`${missingMeals.join('、')}的饮食记录`);
          }
        }
        if (exerciseRecords.length === 0) {
          missingItems.push('今日运动打卡');
        }
        if (!hasWeightRecord) {
          missingItems.push('今日体重记录');
        }
        
        if (missingItems.length > 0) {
          const newNotif: Notification = {
            id: generateId('notif'),
            userId: 'user-001',
            type: 'reminder',
            title: '⏰ 补记提醒',
            content: `今天还有 ${missingItems.join('、')} 未完成记录，记得补录哦！完整的记录有助于营养师更准确地评估您的减重情况。`,
            read: false,
            createdAt: getTodayISO(),
          };
          
          set((state) => {
            const updated = [newNotif, ...state.notifications];
            storage.set('notifications', updated);
            return { notifications: updated };
          });
        }
      }
    }
  },
}));
