import { format, parseISO, differenceInDays, startOfWeek, endOfWeek, subDays, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatDate = (date: string | Date, pattern: string = 'yyyy-MM-dd'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: zhCN });
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MM月dd日 HH:mm', { locale: zhCN });
};

export const formatTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm');
};

export const getToday = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const getTodayISO = (): string => {
  return new Date().toISOString();
};

export const getDaysAgo = (days: number): string => {
  return format(subDays(new Date(), days), 'yyyy-MM-dd');
};

export const getCurrentWeekRange = (): { start: string; end: string } => {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 });
  const end = endOfWeek(now, { weekStartsOn: 1 });
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  };
};

export const getDaysBetween = (start: string, end: string): number => {
  return differenceInDays(parseISO(end), parseISO(start));
};

export const isToday = (date: string): boolean => {
  return isSameDay(parseISO(date), new Date());
};

export const getMealLabel = (type: string): string => {
  const labels: Record<string, string> = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '加餐',
  };
  return labels[type] || type;
};

export const getMealEmoji = (type: string): string => {
  const emojis: Record<string, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍎',
  };
  return emojis[type] || '🍽️';
};

export const generateDaysArray = (days: number): string[] => {
  const result: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    result.push(getDaysAgo(i));
  }
  return result;
};

export const getMonthDays = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const firstDayOfWeek = firstDay.getDay();
  const startPadding = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  
  for (let i = startPadding - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
};
