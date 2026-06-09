import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { getMonthDays } from '@/utils/date';
import { useExerciseStore } from '@/store/useExerciseStore';
import { useDietStore } from '@/store/useDietStore';
import { useBodyStore } from '@/store/useBodyStore';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { records: exerciseRecords } = useExerciseStore();
  const { records: dietRecords } = useDietStore();
  const { records: weightRecords } = useBodyStore();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const days = getMonthDays(year, month);
  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const hasExercise = exerciseRecords.some(r => r.date === dateStr);
    const hasDiet = dietRecords.some(r => r.date === dateStr);
    const hasWeight = weightRecords.some(r => r.date === dateStr);
    
    return { hasExercise, hasDiet, hasWeight };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-warmgray-800">
          {format(currentDate, 'yyyy年 MM月')}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-cream-100 transition-colors"
          >
            <ChevronLeft size={20} className="text-warmgray-600" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-cream-100 transition-colors"
          >
            <ChevronRight size={20} className="text-warmgray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div
            key={day}
            className="h-10 flex items-center justify-center text-sm font-medium text-warmgray-400"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const status = getDayStatus(date);
          const today = isToday(date);
          const currentMonth = isCurrentMonth(date);
          const completedCount = [status.hasDiet, status.hasExercise, status.hasWeight].filter(Boolean).length;

          return (
            <div
              key={index}
              className={`relative aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all ${
                !currentMonth ? 'opacity-30' : ''
              } ${today ? 'bg-primary-50 ring-2 ring-primary-500' : 'hover:bg-cream-100'}`}
            >
              <span className={`text-sm font-medium ${
                today ? 'text-primary-600' : currentMonth ? 'text-warmgray-700' : 'text-warmgray-400'
              }`}>
                {date.getDate()}
              </span>
              
              <div className="flex gap-0.5 mt-1">
                {status.hasDiet && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500" title="饮食已记录" />
                )}
                {status.hasExercise && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-500" title="运动已打卡" />
                )}
                {status.hasWeight && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="体重已记录" />
                )}
              </div>
              
              {completedCount === 3 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs">
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-cream-200">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary-500" />
          <span className="text-sm text-warmgray-500">饮食</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-accent-500" />
          <span className="text-sm text-warmgray-500">运动</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-sm text-warmgray-500">体重</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
