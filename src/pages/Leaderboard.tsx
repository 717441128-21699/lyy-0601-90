import { useState } from 'react';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  EyeOff,
  Flame,
  Target,
  Award,
  Crown,
  Medal,
  Users,
} from 'lucide-react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useUserStore } from '@/store/useUserStore';

const LeaderboardPage = () => {
  const { rankings } = useNotificationStore();
  const { user, setWeightHidden } = useUserStore();
  const [activeTab, setActiveTab] = useState<'weight' | 'checkin' | 'exercise'>('weight');

  const sortedRankings = [...rankings].sort((a, b) => {
    if (activeTab === 'weight') return b.weightLossPercent - a.weightLossPercent;
    if (activeTab === 'checkin') return b.checkInRate - a.checkInRate;
    return b.exerciseMinutes - a.exerciseMinutes;
  });

  const myRanking = sortedRankings.find(r => r.userId === user.id);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown size={20} className="text-yellow-500" fill="currentColor" />;
    if (rank === 2) return <Medal size={20} className="text-gray-400" fill="currentColor" />;
    if (rank === 3) return <Medal size={20} className="text-amber-600" fill="currentColor" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-warmgray-500">{rank}</span>;
  };

  const getRankGradient = (rank: number) => {
    if (rank === 1) return 'from-yellow-50 to-amber-50 border-yellow-200';
    if (rank === 2) return 'from-gray-50 to-slate-50 border-gray-200';
    if (rank === 3) return 'from-amber-50 to-orange-50 border-amber-200';
    return 'from-white to-cream-50 border-cream-200';
  };

  const displayWeight = (value: number) => {
    if (user.weightHidden) {
      return <span className="blur-weight">•••</span>;
    }
    return <span className="font-mono">{value.toFixed(1)}%</span>;
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current < previous) return <TrendingUp size={16} className="text-primary-500" />;
    if (current > previous) return <TrendingDown size={16} className="text-red-500" />;
    return <Minus size={16} className="text-warmgray-400" />;
  };

  const getTrendText = (current: number, previous: number) => {
    if (current < previous) return `上升 ${previous - current} 位`;
    if (current > previous) return `下降 ${current - previous} 位`;
    return '持平';
  };

  const topThree = sortedRankings.slice(0, 3);
  const others = sortedRankings.slice(3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warmgray-800">小组榜单</h1>
          <p className="text-warmgray-500 mt-1">{user.groupName} · 一起努力，共同进步</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-warmgray-500" />
            <span className="text-sm text-warmgray-600">{rankings.length} 人</span>
          </div>
          <button
            onClick={() => setWeightHidden(!user.weightHidden)}
            className="p-2.5 bg-white rounded-xl border border-cream-200 hover:bg-cream-50 transition-colors flex items-center gap-2"
          >
            {user.weightHidden ? (
              <>
                <EyeOff size={18} className="text-warmgray-500" />
                <span className="text-sm text-warmgray-600">显示体重</span>
              </>
            ) : (
              <>
                <Eye size={18} className="text-warmgray-500" />
                <span className="text-sm text-warmgray-600">隐藏体重</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-gradient bg-gradient-to-br from-yellow-500 to-amber-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-75">我的排名</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-bold font-mono">{myRanking?.rank || '--'}</span>
                <span className="text-sm opacity-75">/ {rankings.length} 名</span>
              </div>
              {myRanking && (
                <div className="flex items-center gap-1 mt-2 text-sm">
                  {getTrendIcon(myRanking.rank, myRanking.previousRank)}
                  <span>{getTrendText(myRanking.rank, myRanking.previousRank)}</span>
                </div>
              )}
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Trophy size={32} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-warmgray-500">减重百分比</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-primary-500 font-mono">
                  {displayWeight(myRanking?.weightLossPercent || 0)}
                </span>
              </div>
              <p className="text-sm text-warmgray-400 mt-2">
                本周变化 {myRanking?.lastWeekChange?.toFixed(1) || '0'} kg
              </p>
            </div>
            <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
              <Target size={28} className="text-primary-500" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-warmgray-500">本周运动</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-accent-500 font-mono">{myRanking?.exerciseMinutes || '--'}</span>
                <span className="text-warmgray-500">分钟</span>
              </div>
              <p className="text-sm text-warmgray-400 mt-2">
                打卡率 {myRanking?.checkInRate || 0}%
              </p>
            </div>
            <div className="w-14 h-14 bg-accent-100 rounded-2xl flex items-center justify-center">
              <Flame size={28} className="text-accent-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-warmgray-800 flex items-center gap-2">
            <Trophy size={20} className="text-yellow-500" />
            排行榜
          </h3>
          <div className="flex items-center gap-1 bg-cream-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('weight')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
                activeTab === 'weight'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-warmgray-500 hover:text-warmgray-700'
              }`}
            >
              <Target size={14} />
              减重榜
            </button>
            <button
              onClick={() => setActiveTab('checkin')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
                activeTab === 'checkin'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-warmgray-500 hover:text-warmgray-700'
              }`}
            >
              <Award size={14} />
              打卡榜
            </button>
            <button
              onClick={() => setActiveTab('exercise')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
                activeTab === 'exercise'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-warmgray-500 hover:text-warmgray-700'
              }`}
            >
              <Flame size={14} />
              运动榜
            </button>
          </div>
        </div>

        <div className="flex justify-center items-end gap-6 mb-8">
          {[1, 0, 2].map((index) => {
            const member = topThree[index];
            if (!member) return null;
            const heights = ['h-28', 'h-36', 'h-20'];
            const isMe = member.userId === user.id;
            
            return (
              <div key={member.userId} className="flex flex-col items-center">
                <div className={`relative mb-2 ${index === 1 ? 'order-first' : ''}`}>
                  <img
                    src={member.avatar}
                    alt={member.userName}
                    className={`w-16 h-16 rounded-full border-4 ${
                      isMe ? 'border-primary-400 ring-4 ring-primary-100' : 'border-white'
                    } shadow-lg`}
                  />
                  <div className="absolute -top-1 -right-1 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center">
                    {getRankBadge(member.rank)}
                  </div>
                </div>
                <p className={`font-semibold mb-1 ${isMe ? 'text-primary-600' : 'text-warmgray-800'}`}>
                  {member.userName}
                  {isMe && <span className="ml-1 text-xs">(我)</span>}
                </p>
                <p className="text-sm text-warmgray-500 mb-3">
                  {activeTab === 'weight' && `${member.weightLossPercent}%`}
                  {activeTab === 'checkin' && `${member.checkInRate}% 打卡率`}
                  {activeTab === 'exercise' && `${member.exerciseMinutes} 分钟`}
                </p>
                <div
                  className={`w-24 ${heights[index]} rounded-t-2xl flex items-end justify-center pb-3 ${
                    member.rank === 1
                      ? 'bg-gradient-to-t from-yellow-500 to-yellow-400'
                      : member.rank === 2
                      ? 'bg-gradient-to-t from-gray-400 to-gray-300'
                      : 'bg-gradient-to-t from-amber-500 to-amber-400'
                  }`}
                >
                  <span className="text-white font-bold text-lg font-mono">
                    {activeTab === 'weight' && `-${member.lastWeekChange}kg`}
                    {activeTab === 'checkin' && member.checkInRate}
                    {activeTab === 'exercise' && member.exerciseMinutes}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          {others.map((member) => {
            const isMe = member.userId === user.id;
            return (
              <div
                key={member.userId}
                className={`p-4 rounded-2xl border bg-gradient-to-r ${getRankGradient(member.rank)} ${
                  isMe ? 'ring-2 ring-primary-400' : ''
                } hover:shadow-md transition-all`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 flex items-center justify-center">
                    {getRankBadge(member.rank)}
                  </div>
                  <img
                    src={member.avatar}
                    alt={member.userName}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${isMe ? 'text-primary-600' : 'text-warmgray-800'}`}>
                        {member.userName}
                        {isMe && <span className="text-xs text-primary-500">(我)</span>}
                      </span>
                      {getTrendIcon(member.rank, member.previousRank)}
                      <span className="text-xs text-warmgray-500">
                        {getTrendText(member.rank, member.previousRank)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-warmgray-500 flex items-center gap-1">
                        <Target size={14} className="text-primary-500" />
                        {member.weightLossPercent}% 减重
                      </span>
                      <span className="text-sm text-warmgray-500 flex items-center gap-1">
                        <Award size={14} className="text-accent-500" />
                        {member.checkInRate}% 打卡
                      </span>
                      <span className="text-sm text-warmgray-500 flex items-center gap-1">
                        <Flame size={14} className="text-orange-500" />
                        {member.exerciseMinutes} 分钟
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600 font-mono">
                      {activeTab === 'weight' && `${member.weightLossPercent}%`}
                      {activeTab === 'checkin' && `${member.checkInRate}%`}
                      {activeTab === 'exercise' && `${member.exerciseMinutes}`}
                    </p>
                    <p className="text-xs text-warmgray-400">
                      {activeTab === 'weight' && '减重比例'}
                      {activeTab === 'checkin' && '打卡率'}
                      {activeTab === 'exercise' && '运动时长'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-gradient bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={20} />
            <h3 className="font-semibold">小组荣誉</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
              <span>本周减重冠军</span>
              <span className="font-semibold">张大勇 -1.5kg</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
              <span>最佳打卡达人</span>
              <span className="font-semibold">李小美 92%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
              <span>运动狂人</span>
              <span className="font-semibold">张大勇 560分钟</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-warmgray-800 mb-4">💪 小组平均数据</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary-50 rounded-xl">
              <p className="text-2xl font-bold text-primary-600 font-mono">5.4%</p>
              <p className="text-xs text-warmgray-500 mt-1">平均减重</p>
            </div>
            <div className="text-center p-4 bg-accent-50 rounded-xl">
              <p className="text-2xl font-bold text-accent-600 font-mono">81%</p>
              <p className="text-xs text-warmgray-500 mt-1">平均打卡率</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-2xl font-bold text-purple-600 font-mono">363</p>
              <p className="text-xs text-warmgray-500 mt-1">平均运动分钟</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-cream-50 rounded-xl">
            <p className="text-sm text-warmgray-600">
              <span className="font-medium text-primary-600">🎉 小组进度：</span>
              本周已完成整体减重目标的 78%，继续加油！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
