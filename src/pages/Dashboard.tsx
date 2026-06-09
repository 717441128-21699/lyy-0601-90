import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Flame,
  Target,
  TrendingDown,
  UtensilsCrossed,
  Dumbbell,
  Scale,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Clock,
  Star,
  Bell,
  Megaphone,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import ProgressRing from '@/components/ProgressRing';
import Calendar from '@/components/Calendar';
import { useUserStore } from '@/store/useUserStore';
import { useDietStore } from '@/store/useDietStore';
import { useExerciseStore } from '@/store/useExerciseStore';
import { useBodyStore } from '@/store/useBodyStore';
import { useNoteStore } from '@/store/useNoteStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { getWeightLossRate, formatCalories } from '@/utils/calories';
import { getToday, formatDate } from '@/utils/date';

const Dashboard = () => {
  const { user, setWeightHidden } = useUserStore();
  const { getTodayRecords: getTodayDietRecords } = useDietStore();
  const { getTodayRecords: getTodayExerciseRecords, getStreakDays, getWeeklyTotalMinutes } = useExerciseStore();
  const { getLatestRecord, getWeeklyRecords } = useBodyStore();
  const { todos, toggleTodo } = useNoteStore();
  const { notifications, checkAndSendReminders, markAsRead } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [highlightNotification, setHighlightNotification] = useState(false);

  useEffect(() => {
    checkAndSendReminders();
  }, [checkAndSendReminders]);

  useEffect(() => {
    if (location.state?.highlightNotification) {
      setHighlightNotification(true);
      setTimeout(() => {
        const element = document.getElementById('notifications-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      setTimeout(() => setHighlightNotification(false), 3000);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markAsRead(notif.id);
    switch (notif.type) {
      case 'high_risk':
        navigate('/diet', { state: { highlightId: notif.relatedRecordId } });
        break;
      case 'note':
        navigate('/nutritionist', { state: { highlightNoteId: notif.relatedRecordId } });
        break;
      case 'report':
        navigate('/reports', { state: { highlightReportId: notif.relatedRecordId } });
        break;
      case 'reminder':
        navigate('/diet');
        break;
      default:
        navigate('/notifications');
    }
  };

  const todayDietRecords = getTodayDietRecords();
  const todayExerciseRecords = getTodayExerciseRecords();
  const latestWeight = getLatestRecord();
  const weeklyWeightRecords = getWeeklyRecords();
  const streakDays = getStreakDays();
  const weeklyMinutes = getWeeklyTotalMinutes();

  const weightLossRate = getWeightLossRate(user.startWeight, user.currentWeight);
  const totalWeightLoss = user.startWeight - user.currentWeight;
  const remainingWeight = user.currentWeight - user.targetWeight;
  const progressPercent = Math.min(((user.startWeight - user.currentWeight) / (user.startWeight - user.targetWeight)) * 100, 100);

  const todayCalories = todayDietRecords.reduce((sum, r) => sum + r.calorieRange[0], 0);
  const todayExerciseCalories = todayExerciseRecords.reduce((sum, r) => sum + r.calories, 0);
  const dailyTarget = 1500;

  const highPriorityTodos = todos.filter(t => t.priority === 'high' && !t.completed);
  const unreadNotifications = notifications.filter(n => !n.read).slice(0, 3);

  const [showCelebration, setShowCelebration] = useState(false);

  const handleCheckIn = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const getTodoIcon = (type: string) => {
    switch (type) {
      case 'diet': return <UtensilsCrossed size={18} className="text-primary-500" />;
      case 'exercise': return <Dumbbell size={18} className="text-accent-500" />;
      case 'weight': return <Scale size={18} className="text-blue-500" />;
      default: return <Clock size={18} className="text-warmgray-500" />;
    }
  };

  const getTodoLink = (type: string) => {
    switch (type) {
      case 'diet': return '/diet';
      case 'exercise': return '/exercise';
      case 'weight': return '/body';
      case 'note': return '/nutritionist';
      default: return '/';
    }
  };

  return (
    <div className="space-y-6">
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="animate-bounce-soft text-center">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-2xl font-bold text-primary-600">打卡成功！</div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warmgray-800">
            早上好，{user.name}！
          </h1>
          <p className="text-warmgray-500 mt-1">
            {formatDate(getToday(), 'yyyy年MM月dd日 EEEE')} · 今天是减重第 {Math.ceil((Date.now() - new Date(user.joinDate).getTime()) / (1000 * 60 * 60 * 24))} 天
          </p>
        </div>
        <button onClick={handleCheckIn} className="btn-accent flex items-center gap-2">
          <Flame size={20} />
          立即打卡
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="当前体重"
          value={user.weightHidden ? '•••' : `${user.currentWeight} kg`}
          subtitle={latestWeight ? `上次记录: ${formatDate(latestWeight.date)}` : '暂无记录'}
          icon={<Scale size={28} />}
          trend={{ value: weeklyWeightRecords.length >= 2 ? 1.8 : 0, label: '较上周', isPositive: true }}
          delay={0}
        />
        <StatCard
          title="累计减重"
          value={`${totalWeightLoss.toFixed(1)} kg`}
          subtitle={`减重率 ${weightLossRate}%`}
          icon={<TrendingDown size={28} />}
          gradient="from-accent-400 to-accent-600"
          delay={1}
        />
        <StatCard
          title="目标体重"
          value={`${user.targetWeight} kg`}
          subtitle={`还需减重 ${remainingWeight.toFixed(1)} kg`}
          icon={<Target size={28} />}
          gradient="from-blue-400 to-blue-600"
          delay={2}
        />
        <StatCard
          title="连续打卡"
          value={`${streakDays} 天`}
          subtitle={`本周运动 ${weeklyMinutes} 分钟`}
          icon={<Flame size={28} />}
          gradient="from-purple-400 to-purple-600"
          delay={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card-gradient bg-gradient-to-br from-primary-500 to-primary-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold opacity-90">减重进度</h3>
                <p className="text-sm opacity-75 mt-1">距离目标还有 {remainingWeight.toFixed(1)} kg</p>
              </div>
              <button
                onClick={() => setWeightHidden(!user.weightHidden)}
                className="px-4 py-2 bg-white/20 rounded-xl text-sm font-medium hover:bg-white/30 transition-colors"
              >
                {user.weightHidden ? '👁️ 显示体重' : '🙈 隐藏体重'}
              </button>
            </div>
            
            <div className="mt-6 flex items-center gap-8">
              <ProgressRing
                value={progressPercent}
                max={100}
                size={140}
                strokeWidth={14}
                label={`${progressPercent.toFixed(0)}%`}
                sublabel="已完成"
                gradient="from-white to-white"
              />
              
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="opacity-75">起始体重</span>
                  <span className="font-mono font-semibold">
                    {user.weightHidden ? '•••' : `${user.startWeight} kg`}
                  </span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="opacity-75">目标体重</span>
                  <span className="font-mono font-semibold">
                    {user.weightHidden ? '•••' : `${user.targetWeight} kg`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-warmgray-800 mb-4">今日概览</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-cream-100 rounded-xl">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <UtensilsCrossed size={24} className="text-primary-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-warmgray-700">饮食摄入</span>
                  <span className="font-mono font-bold text-primary-600">
                    {formatCalories(todayCalories)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-cream-200 rounded-full mt-2">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all"
                    style={{ width: `${Math.min((todayCalories / dailyTarget) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-warmgray-400 mt-1">
                  已记录 {todayDietRecords.length} 餐 · 目标 {dailyTarget} kcal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-accent-50 rounded-xl">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                <Dumbbell size={24} className="text-accent-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-warmgray-700">运动消耗</span>
                  <span className="font-mono font-bold text-accent-600">
                    {formatCalories(todayExerciseCalories)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-accent-100 rounded-full mt-2">
                  <div
                    className="h-full bg-accent-500 rounded-full transition-all"
                    style={{ width: `${Math.min((todayExerciseCalories / 500) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-warmgray-400 mt-1">
                  已运动 {todayExerciseRecords.reduce((sum, r) => sum + r.duration, 0)} 分钟
                </p>
              </div>
            </div>

            <Link to="/diet" className="flex items-center justify-center gap-2 w-full py-3 text-primary-600 hover:bg-primary-50 rounded-xl font-medium transition-colors">
              记录今日数据
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-warmgray-800">今日待办</h3>
            {highPriorityTodos.length > 0 && (
              <span className="tag tag-danger">{highPriorityTodos.length} 项待完成</span>
            )}
          </div>
          
          <div className="space-y-3">
            {todos.slice(0, 5).map((todo) => (
              <div
                key={todo.id}
                className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                  todo.completed ? 'bg-cream-50 opacity-60' : 'hover:bg-cream-50'
                }`}
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    todo.completed
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : 'border-cream-300 hover:border-primary-500'
                  }`}
                >
                  {todo.completed && <CheckCircle2 size={14} />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getTodoIcon(todo.type)}
                    <span className={`font-medium ${todo.completed ? 'line-through text-warmgray-400' : 'text-warmgray-700'}`}>
                      {todo.title}
                    </span>
                    {todo.priority === 'high' && (
                      <AlertTriangle size={14} className="text-accent-500" />
                    )}
                  </div>
                  <p className="text-sm text-warmgray-400 mt-0.5">{todo.description}</p>
                </div>
                
                {!todo.completed && (
                  <Link to={getTodoLink(todo.type)} className="text-primary-500 hover:text-primary-600">
                    <ChevronRight size={18} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Calendar />
        </div>

        <div 
          id="notifications-section"
          className={`card transition-all ${
            highlightNotification ? 'ring-4 ring-primary-300 ring-opacity-75 animate-pulse' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-warmgray-800 flex items-center gap-2">
              <Bell size={20} className="text-primary-500" />
              最新通知
            </h3>
            <Link to="/notifications" className="text-sm text-primary-600 hover:text-primary-700">
              查看全部
            </Link>
          </div>
          
          <div className="space-y-3">
            {unreadNotifications.length === 0 ? (
              <div className="text-center py-8 text-warmgray-400">
                <Star size={32} className="mx-auto mb-2 opacity-50" />
                <p>暂无新通知</p>
              </div>
            ) : (
              unreadNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 rounded-xl border-l-4 cursor-pointer hover:shadow-md transition-all ${
                    notif.type === 'high_risk'
                      ? 'bg-red-50 border-red-500'
                      : notif.type === 'reminder'
                      ? 'bg-accent-50 border-accent-500'
                      : notif.type === 'system'
                      ? 'bg-blue-50 border-blue-500'
                      : notif.type === 'report'
                      ? 'bg-purple-50 border-purple-500'
                      : 'bg-primary-50 border-primary-500'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">
                      {notif.type === 'high_risk' ? '⚠️' : 
                       notif.type === 'reminder' ? '⏰' : 
                       notif.type === 'system' ? '📢' :
                       notif.type === 'report' ? '📊' :
                       notif.type === 'note' ? '💬' : '🔔'}
                    </span>
                    <div>
                      <h4 className="font-medium text-warmgray-700">{notif.title}</h4>
                      <p className="text-sm text-warmgray-500 line-clamp-2 mt-0.5">
                        {notif.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-cream-200">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold">
                王
              </div>
              <div className="flex-1">
                <p className="font-medium text-warmgray-700">王营养师</p>
                <p className="text-sm text-warmgray-500">在线 · 可咨询</p>
              </div>
              <Link to="/nutritionist" className="btn-primary py-2 px-4 text-sm">
                联系
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-warmgray-800">本周数据趋势</h3>
          <Link to="/reports" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
            查看完整报告
            <ChevronRight size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <ProgressRing
              value={todayDietRecords.length}
              max={4}
              label={`${todayDietRecords.length}/4`}
              sublabel="今日饮食"
              size={100}
              strokeWidth={8}
            />
            <p className="mt-3 text-sm text-warmgray-500">本周平均 3.5 餐/天</p>
          </div>
          
          <div className="text-center">
            <ProgressRing
              value={weeklyMinutes}
              max={420}
              label={`${weeklyMinutes}`}
              sublabel="运动分钟"
              size={100}
              strokeWidth={8}
              gradient="from-accent-400 to-accent-600"
            />
            <p className="mt-3 text-sm text-warmgray-500">目标 420 分钟/周</p>
          </div>
          
          <div className="text-center">
            <ProgressRing
              value={weeklyWeightRecords.length}
              max={7}
              label={`${weeklyWeightRecords.length}/7`}
              sublabel="称重次数"
              size={100}
              strokeWidth={8}
              gradient="from-blue-400 to-blue-600"
            />
            <p className="mt-3 text-sm text-warmgray-500">建议每天早上称重</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
