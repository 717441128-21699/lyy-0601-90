import { useState, useMemo } from 'react';
import {
  Plus,
  Flame,
  Timer,
  TrendingUp,
  X,
  Calendar,
  Award,
  Activity,
  CheckCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useExerciseStore } from '@/store/useExerciseStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { getToday, formatDate, generateDaysArray, formatDateTime } from '@/utils/date';
import { formatCalories } from '@/utils/calories';
import type { ExerciseType } from '@/types';

const ExercisePage = () => {
  const { records, exerciseTypes, addRecord, getStreakDays, getWeeklyTotalMinutes } = useExerciseStore();
  const { addNotification } = useNotificationStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<ExerciseType | null>(null);
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const today = getToday();
  const todayRecords = records.filter(r => r.date === today);
  const historyRecords = records.filter(r => r.date !== today);
  const streakDays = getStreakDays();
  const weeklyMinutes = getWeeklyTotalMinutes();

  const todayCalories = todayRecords.reduce((sum, r) => sum + r.calories, 0);
  const todayDuration = todayRecords.reduce((sum, r) => sum + r.duration, 0);

  const estimatedCalories = selectedType ? duration * selectedType.caloriesPerMin : 0;

  const categoryLabels: Record<string, string> = {
    cardio: '有氧运动',
    strength: '力量训练',
    flexibility: '柔韧拉伸',
    hiit: '高强度间歇',
  };

  const categories = Array.from(new Set(exerciseTypes.map(t => t.category)));

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAddExercise = () => {
    if (!selectedType) return;
    
    const record = addRecord({
      date: today,
      exerciseType: selectedType.name,
      exerciseTypeId: selectedType.id,
      duration,
      notes,
    });

    const newStreak = getStreakDays();
    
    addNotification({
      type: 'system',
      title: '💪 运动打卡成功',
      content: `您完成了 ${selectedType.name} ${duration} 分钟，消耗约 ${estimatedCalories} 千卡，继续保持！`,
      relatedRecordId: record.id,
    });

    if (newStreak > streakDays && newStreak % 7 === 0) {
      addNotification({
        type: 'system',
        title: '🏆 里程碑达成',
        content: `恭喜！您已连续运动 ${newStreak} 天，达成新的里程碑！`,
        relatedRecordId: record.id,
      });
      showSuccess(`太棒了！连续运动 ${newStreak} 天，已达成里程碑！`);
    } else {
      showSuccess(`${selectedType.name} ${duration} 分钟已记录，消耗 ${estimatedCalories} 千卡`);
    }
    
    setSelectedType(null);
    setDuration(30);
    setNotes('');
    setShowAddModal(false);
  };

  const weeklyData = useMemo(() => {
    const days = generateDaysArray(7);
    return days.map(date => {
      const dayRecords = records.filter(r => r.date === date);
      return {
        date: formatDate(date, 'MM/dd'),
        minutes: dayRecords.reduce((sum, r) => sum + r.duration, 0),
        calories: dayRecords.reduce((sum, r) => sum + r.calories, 0),
      };
    });
  }, [records]);

  const monthlyData = useMemo(() => {
    const days = generateDaysArray(30);
    return days.map(date => {
      const dayRecords = records.filter(r => r.date === date);
      return {
        date: formatDate(date, 'MM/dd'),
        minutes: dayRecords.reduce((sum, r) => sum + r.duration, 0),
      };
    });
  }, [records]);

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="fixed top-20 right-6 z-50 animate-fade-in">
          <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-xl shadow-lg border border-primary-200">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <CheckCircle size={18} className="text-primary-500" />
            </div>
            <span className="text-warmgray-700 font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warmgray-800">运动打卡</h1>
          <p className="text-warmgray-500 mt-1">坚持运动，遇见更好的自己</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          记录运动
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-gradient bg-gradient-to-br from-accent-500 to-accent-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-75">今日运动</p>
              <p className="text-3xl font-bold mt-2 font-mono">{todayDuration}</p>
              <p className="text-sm opacity-75">分钟</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Timer size={28} />
            </div>
          </div>
        </div>

        <div className="card-gradient bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-75">消耗热量</p>
              <p className="text-3xl font-bold mt-2 font-mono">{todayCalories}</p>
              <p className="text-sm opacity-75">kcal</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Flame size={28} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-warmgray-500">连续打卡</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-accent-500 font-mono">{streakDays}</span>
                <span className="text-warmgray-500">天</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Flame
                    key={i}
                    size={16}
                    className={i < Math.min(streakDays, 5) ? 'text-accent-500' : 'text-cream-200'}
                    fill={i < Math.min(streakDays, 5) ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
            </div>
            <div className="w-14 h-14 bg-accent-100 rounded-2xl flex items-center justify-center">
              <Award size={28} className="text-accent-500" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-warmgray-500">本周累计</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-primary-500 font-mono">{weeklyMinutes}</span>
                <span className="text-warmgray-500">分钟</span>
              </div>
              <p className="text-sm text-warmgray-400 mt-2">目标 420 分钟</p>
            </div>
            <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
              <TrendingUp size={28} className="text-primary-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-warmgray-800">本周运动趋势</h3>
              <span className="tag tag-success">已完成 {weeklyMinutes}/420 分钟</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                  <XAxis dataKey="date" stroke="#78716C" fontSize={12} />
                  <YAxis stroke="#78716C" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: number) => [`${value} 分钟`, '运动时长']}
                  />
                  <Area
                    type="monotone"
                    dataKey="minutes"
                    stroke="#10B981"
                    strokeWidth={3}
                    fill="url(#colorMinutes)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-cream-200">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'today' ? 'text-primary-600' : 'text-warmgray-500 hover:text-warmgray-700'
              }`}
            >
              今日运动
              {activeTab === 'today' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'history' ? 'text-primary-600' : 'text-warmgray-500 hover:text-warmgray-700'
              }`}
            >
              历史记录
              {activeTab === 'history' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
              )}
            </button>
          </div>

          {activeTab === 'today' ? (
            <div className="space-y-4">
              {todayRecords.length === 0 ? (
                <div
                  onClick={() => setShowAddModal(true)}
                  className="p-12 border-2 border-dashed border-cream-300 rounded-2xl text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all"
                >
                  <Activity size={48} className="mx-auto text-warmgray-300 mb-3" />
                  <p className="text-warmgray-500 text-lg">今天还没有运动记录</p>
                  <p className="text-warmgray-400 text-sm mt-1">点击开始记录今日运动</p>
                </div>
              ) : (
                todayRecords.map((record) => {
                  const exerciseType = exerciseTypes.find(t => t.id === record.exerciseTypeId);
                  return (
                    <div
                      key={record.id}
                      className="p-4 bg-white rounded-2xl border border-cream-200 flex items-center gap-4 hover:shadow-card-hover transition-all"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-accent-100 to-primary-100 rounded-2xl flex items-center justify-center text-3xl">
                        {exerciseType?.icon || '🏃‍♀️'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-warmgray-800">{record.exerciseType}</h4>
                          <span className="tag tag-success">{record.duration} 分钟</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-warmgray-500">
                          <span className="flex items-center gap-1">
                            <Flame size={14} className="text-accent-500" />
                            {formatCalories(record.calories)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDateTime(record.createdAt)}
                          </span>
                        </div>
                        {record.notes && (
                          <p className="text-sm text-warmgray-400 mt-2">{record.notes}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
              {historyRecords.slice(0, 20).map((record) => {
                const exerciseType = exerciseTypes.find(t => t.id === record.exerciseTypeId);
                return (
                  <div
                    key={record.id}
                    className="p-4 bg-white rounded-xl border border-cream-200 flex items-center gap-3"
                  >
                    <span className="text-2xl">{exerciseType?.icon || '🏃‍♀️'}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-warmgray-800">{record.exerciseType}</span>
                        <span className="text-sm text-warmgray-500">{record.date}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <span className="text-warmgray-500">{record.duration} 分钟</span>
                        <span className="text-accent-500">{formatCalories(record.calories)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category} className="card">
              <h3 className="font-semibold text-warmgray-800 mb-4">{categoryLabels[category]}</h3>
              <div className="space-y-3">
                {exerciseTypes
                  .filter(t => t.category === category)
                  .map((type) => (
                    <div
                      key={type.id}
                      onClick={() => {
                        setSelectedType(type);
                        setShowAddModal(true);
                      }}
                      className="p-3 bg-cream-50 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-primary-50 hover:border-primary-300 border border-transparent transition-all"
                    >
                      <span className="text-2xl">{type.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-warmgray-800">{type.name}</p>
                        <p className="text-xs text-warmgray-400">{type.caloriesPerMin} kcal/分钟</p>
                      </div>
                      <Plus size={18} className="text-primary-500" />
                    </div>
                  ))}
              </div>
            </div>
          ))}

          <div className="card-gradient bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={20} />
              <h3 className="font-semibold">运动建议</h3>
            </div>
            <div className="space-y-2 text-sm opacity-90">
              <p>• 每周建议运动 150-300 分钟中等强度运动</p>
              <p>• 力量训练每周 2-3 次，每次 30 分钟</p>
              <p>• 运动前热身 5-10 分钟，避免受伤</p>
              <p>• 运动后及时补充蛋白质和水分</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-warmgray-800 mb-4">近30天运动时长</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
              <XAxis dataKey="date" stroke="#78716C" fontSize={10} tick={{ fill: '#A8A29E' }} />
              <YAxis stroke="#78716C" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number) => [`${value} 分钟`, '运动时长']}
              />
              <Line
                type="monotone"
                dataKey="minutes"
                stroke="#F97316"
                strokeWidth={2}
                dot={{ fill: '#F97316', r: 3 }}
                activeDot={{ fill: '#F97316', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-bounce-soft">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-warmgray-800">记录运动</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedType(null);
                }}
                className="p-2 hover:bg-cream-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {!selectedType ? (
                <div>
                  <label className="block text-sm font-medium text-warmgray-700 mb-3">选择运动类型</label>
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto scrollbar-thin">
                    {exerciseTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type)}
                        className="p-3 bg-cream-100 rounded-xl text-center hover:bg-primary-100 hover:border-primary-400 border-2 border-transparent transition-all"
                      >
                        <span className="text-2xl block mb-1">{type.icon}</span>
                        <span className="text-xs text-warmgray-600">{type.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl flex items-center gap-4">
                    <span className="text-4xl">{selectedType.icon}</span>
                    <div>
                      <h4 className="font-semibold text-warmgray-800">{selectedType.name}</h4>
                      <p className="text-sm text-warmgray-500">
                        {selectedType.caloriesPerMin} kcal/分钟 · {categoryLabels[selectedType.category]}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedType(null)}
                      className="ml-auto text-warmgray-400 hover:text-warmgray-600"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-warmgray-700 mb-2">
                      运动时长: <span className="text-primary-600 font-bold">{duration} 分钟</span>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="180"
                      step="5"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full h-2 bg-cream-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                    <div className="flex justify-between text-xs text-warmgray-400 mt-1">
                      <span>5分钟</span>
                      <span>180分钟</span>
                    </div>
                  </div>

                  <div className="p-4 bg-accent-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-warmgray-600">预计消耗</span>
                      <span className="text-2xl font-bold text-accent-600 font-mono">
                        {formatCalories(estimatedCalories)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-warmgray-700 mb-2">备注（可选）</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="记录一下今天的运动感受..."
                      className="input-field h-20 resize-none"
                    />
                  </div>

                  <button
                    onClick={handleAddExercise}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Flame size={18} />
                    完成打卡
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExercisePage;
