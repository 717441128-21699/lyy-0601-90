import { create } from 'zustand';
import type { Notification, WeeklyReport, ReviewRequest, GroupRanking } from '@/types';
import { mockNotifications, mockWeeklyReports, mockReviewRequests, mockGroupRanking } from '@/mock/data';
import { storage, generateId } from '@/utils/storage';
import { getTodayISO } from '@/utils/date';

interface NotificationState {
  notifications: Notification[];
  reports: WeeklyReport[];
  reviewRequests: ReviewRequest[];
  rankings: GroupRanking[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  createReviewRequest: (data: Omit<ReviewRequest, 'id' | 'userId' | 'status' | 'createdAt'>) => void;
  getUnreadCount: () => number;
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
    return { reviewRequests: updated };
  }),
  
  getUnreadCount: () => {
    return get().notifications.filter(n => !n.read).length;
  },
}));
