import { create } from 'zustand';
import type { User } from '@/types';
import { mockUser } from '@/mock/data';
import { storage } from '@/utils/storage';

interface UserState {
  user: User;
  setWeightHidden: (hidden: boolean) => void;
  updateTargetWeight: (weight: number) => void;
  updateCurrentWeight: (weight: number) => void;
  updateCurrentWaist: (waist: number) => void;
}

const getInitialUser = (): User => {
  const stored = storage.get<User | null>('user', null);
  return stored || mockUser;
};

export const useUserStore = create<UserState>((set) => ({
  user: getInitialUser(),
  
  setWeightHidden: (hidden: boolean) => set((state) => {
    const updated = { ...state.user, weightHidden: hidden };
    storage.set('user', updated);
    return { user: updated };
  }),
  
  updateTargetWeight: (weight: number) => set((state) => {
    const updated = { ...state.user, targetWeight: weight };
    storage.set('user', updated);
    return { user: updated };
  }),
  
  updateCurrentWeight: (weight: number) => set((state) => {
    const updated = { ...state.user, currentWeight: weight };
    storage.set('user', updated);
    return { user: updated };
  }),
  
  updateCurrentWaist: (waist: number) => set((state) => {
    const updated = { ...state.user, currentWaist: waist };
    storage.set('user', updated);
    return { user: updated };
  }),
}));
