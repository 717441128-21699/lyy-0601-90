import { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  ChevronRight,
  Download,
  Video,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  X,
  MessageSquare,
  TrendingUp,
  Target,
  Award,
  Flame,
  Scale,
} from 'lucide-react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useUserStore } from '@/store/useUserStore';
import { formatDate, formatDateTime, getToday } from '@/utils/date';
import { useLocation } from 'react-router-dom';

const ReportsPage = () => {
  const { reports, reviewRequests, createReviewRequest, addNotification } = useNotificationStore();
  const { user } = useUserStore();
  const location = useLocation();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [highlightReportId, setHighlightReportId] = useState<string | null>(null);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('19:00');
  const [reviewType, setReviewType] = useState<'video' | 'voice'>('video');
  const [reviewNotes, setReviewNotes] = useState('');

  const latestReport = reports[0];

  useEffect(() => {
    if (location.state?.highlightReportId) {
      setHighlightReportId(location.state.highlightReportId);
      setSelectedReport(location.state.highlightReportId);
      setTimeout(() => {
        const element = document.getElementById(`report-${location.state.highlightReportId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      setTimeout(() => setHighlightReportId(null), 3000);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleCreateReview = () => {
    if (!preferredDate || !preferredTime) return;

    createReviewRequest({
      preferredDate,
      preferredTime,
      type: reviewType,
      notes: reviewNotes,
    });

    setPreferredDate('');
    setPreferredTime('19:00');
    setReviewType('video');
    setReviewNotes('');
    setShowReviewModal(false);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { className: string; icon: React.ReactNode; text: string }> = {
      pending: {
        className: 'bg-yellow-100 text-yellow-700',
        icon: <Clock size={14} />,
        text: '待确认',
      },
      approved: {
        className: 'bg-primary-100 text-primary-700',
        icon: <CheckCircle size={14} />,
        text: '已通过',
      },
      rejected: {
        className: 'bg-red-100 text-red-700',
        icon: <XCircle size={14} />,
        text: '已拒绝',
      },
      completed: {
        className: 'bg-gray-100 text-gray-700',
        icon: <CheckCircle size={14} />,
        text: '已完成',
      },
    };
    return badges[status] || badges.pending;
  };

  const timeSlots = [
    '09:00', '10:00', '11:00',
    '14:00', '15:00', '16:00',
    '19:00', '20:00', '21:00',
  ];

  const getNextWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: formatDate(date, 'MM月dd日 EEEE'),
        weekday: formatDate(date, 'EEE'),
        day: formatDate(date, 'd'),
      });
    }
    return dates;
  };

  const nextWeekDates = getNextWeekDates();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warmgray-800">报告中心</h1>
          <p className="text-warmgray-500 mt-1">查看健康报告，预约一对一复盘</p>
        </div>
        <button
          onClick={() => setShowReviewModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          申请复盘
        </button>
      </div>

      {latestReport && (
        <div className="card-gradient bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={20} />
                <span className="font-semibold">本周健康报告</span>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">最新</span>
              </div>
              <p className="text-sm opacity-75 mb-4">
                {formatDate(latestReport.weekStart)} - {formatDate(latestReport.weekEnd)}
              </p>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm opacity-75">平均热量</p>
                  <p className="text-2xl font-bold font-mono">{latestReport.summary.avgCalories}</p>
                  <p className="text-xs opacity-75">kcal/天</p>
                </div>
                <div>
                  <p className="text-sm opacity-75">运动时长</p>
                  <p className="text-2xl font-bold font-mono">{latestReport.summary.totalExerciseMinutes}</p>
                  <p className="text-xs opacity-75">分钟</p>
                </div>
                <div>
                  <p className="text-sm opacity-75">体重变化</p>
                  <p className="text-2xl font-bold font-mono">{latestReport.summary.weightChange}</p>
                  <p className="text-xs opacity-75">kg</p>
                </div>
                <div>
                  <p className="text-sm opacity-75">打卡天数</p>
                  <p className="text-2xl font-bold font-mono">{latestReport.summary.checkInDays}</p>
                  <p className="text-xs opacity-75">天</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedReport(selectedReport === latestReport.id ? null : latestReport.id)}
              className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
            >
              <ChevronRight size={20} className={`transition-transform ${selectedReport === latestReport.id ? 'rotate-90' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {selectedReport && (
        <div className="card">
          <h3 className="font-semibold text-warmgray-800 mb-4">📊 本周报告详情</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-warmgray-700 mb-3 flex items-center gap-2">
                <Award size={18} className="text-yellow-500" />
                本周亮点
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {latestReport?.highlights.map((highlight, idx) => (
                  <div key={idx} className="p-3 bg-yellow-50 rounded-xl text-sm text-yellow-800">
                    {highlight}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-warmgray-700 mb-3 flex items-center gap-2">
                <MessageSquare size={18} className="text-primary-500" />
                营养师点评
              </h4>
              <div className="p-4 bg-primary-50 rounded-xl border-l-4 border-primary-500">
                <p className="text-primary-800 leading-relaxed">
                  {latestReport?.nutritionistFeedback}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-warmgray-700 mb-3 flex items-center gap-2">
                <Target size={18} className="text-purple-500" />
                下周建议
              </h4>
              <div className="space-y-2">
                {latestReport?.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-cream-50 rounded-xl">
                    <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-warmgray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button className="btn-secondary flex items-center gap-2 flex-1">
                <Download size={18} />
                下载报告
              </button>
              <button
                onClick={() => setShowReviewModal(true)}
                className="btn-primary flex items-center gap-2 flex-1"
              >
                <Video size={18} />
                预约复盘
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-warmgray-800">历史报告</h3>
              <span className="text-sm text-warmgray-500">共 {reports.length} 份</span>
            </div>
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  id={`report-${report.id}`}
                  onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
                  className={`p-4 bg-cream-50 rounded-xl hover:bg-cream-100 transition-colors cursor-pointer ${
                    highlightReportId === report.id ? 'ring-4 ring-primary-300 ring-opacity-75 animate-pulse' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <FileText size={22} className="text-primary-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-warmgray-800">周报告</h4>
                        <p className="text-sm text-warmgray-500">
                          {formatDate(report.weekStart)} - {formatDate(report.weekEnd)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-primary-600 font-mono">
                          {report.summary.weightChange} kg
                        </p>
                        <p className="text-xs text-warmgray-400">体重变化</p>
                      </div>
                      <ChevronRight size={20} className={`text-warmgray-400 transition-transform ${selectedReport === report.id ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-cream-200">
                    <div className="flex items-center gap-1 text-sm text-warmgray-500">
                      <Flame size={14} className="text-accent-500" />
                      {report.summary.totalExerciseMinutes} 分钟运动
                    </div>
                    <div className="flex items-center gap-1 text-sm text-warmgray-500">
                      <Target size={14} className="text-primary-500" />
                      {report.summary.checkInDays} 天打卡
                    </div>
                    <div className="flex items-center gap-1 text-sm text-warmgray-500">
                      <TrendingUp size={14} className="text-purple-500" />
                      {report.summary.avgDailyCalories} kcal/天
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-warmgray-800">复盘申请</h3>
              <button
                onClick={() => setShowReviewModal(true)}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Plus size={14} />
                新建
              </button>
            </div>

            {reviewRequests.length === 0 ? (
              <div className="text-center py-8">
                <Video size={36} className="mx-auto text-warmgray-300 mb-2" />
                <p className="text-warmgray-500 text-sm">暂无复盘申请</p>
                <p className="text-warmgray-400 text-xs mt-1">点击右上角预约一对一指导</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviewRequests.map((request) => {
                  const status = getStatusBadge(request.status);
                  return (
                    <div
                      key={request.id}
                      className={`p-4 rounded-xl border ${
                        request.status === 'pending'
                          ? 'bg-yellow-50 border-yellow-200'
                          : request.status === 'completed'
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-cream-50 border-cream-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {request.type === 'video' ? (
                            <Video size={16} className="text-primary-500" />
                          ) : (
                            <Phone size={16} className="text-accent-500" />
                          )}
                          <span className="font-medium text-warmgray-800">
                            {request.type === 'video' ? '视频复盘' : '语音复盘'}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${status.className}`}>
                          {status.icon}
                          {status.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-warmgray-500 mb-2">
                        <Calendar size={14} />
                        <span>{request.preferredDate}</span>
                        <Clock size={14} />
                        <span>{request.preferredTime}</span>
                      </div>
                      {request.notes && (
                        <p className="text-sm text-warmgray-600 mb-2">{request.notes}</p>
                      )}
                      {request.status === 'approved' && request.meetingUrl && (
                        <a
                          href={request.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                        >
                          进入会议
                        </a>
                      )}
                      {request.status === 'rejected' && request.rejectionReason && (
                        <div className="flex items-start gap-2 p-2 bg-red-50 rounded-lg text-sm text-red-600">
                          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                          <span>{request.rejectionReason}</span>
                        </div>
                      )}
                      <p className="text-xs text-warmgray-400 mt-2">
                        申请时间：{formatDateTime(request.createdAt)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card-gradient bg-gradient-to-br from-accent-500 to-accent-600 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Award size={20} />
              <h3 className="font-semibold">成就徽章</h3>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: '🔥', name: '7天连续', earned: true },
                { icon: '🏆', name: '减重达人', earned: true },
                { icon: '💪', name: '运动健将', earned: true },
                { icon: '🥗', name: '饮食模范', earned: true },
                { icon: '⭐', name: '满勤打卡', earned: true },
                { icon: '🎯', name: '目标达成', earned: false },
                { icon: '💎', name: '坚持30天', earned: false },
                { icon: '👑', name: '减重冠军', earned: false },
              ].map((badge, idx) => (
                <div
                  key={idx}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center ${
                    badge.earned
                      ? 'bg-white/20'
                      : 'bg-black/10 opacity-40'
                  }`}
                >
                  <span className="text-2xl mb-1">{badge.icon}</span>
                  <span className="text-xs opacity-80 text-center">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-warmgray-800 mb-4">📈 数据总览</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-cream-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Scale size={20} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm text-warmgray-500">累计减重</p>
                    <p className="font-bold text-warmgray-800 font-mono">-4.5 kg</p>
                  </div>
                </div>
                <span className="tag tag-success">优秀</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-cream-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                    <Flame size={20} className="text-accent-500" />
                  </div>
                  <div>
                    <p className="text-sm text-warmgray-500">累计运动</p>
                    <p className="font-bold text-warmgray-800 font-mono">3,240 分钟</p>
                  </div>
                </div>
                <span className="tag tag-success">优秀</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-cream-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Calendar size={20} className="text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-warmgray-500">参与天数</p>
                    <p className="font-bold text-warmgray-800 font-mono">58 天</p>
                  </div>
                </div>
                <span className="tag tag-success">坚持</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-bounce-soft max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-warmgray-800">申请一对一复盘</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-cream-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="p-4 bg-primary-50 rounded-xl">
                <p className="text-sm text-primary-700">
                  <span className="font-medium">💡 小提示：</span>
                  一对一复盘可以帮助您深入分析减重过程中的问题，制定更个性化的方案。建议每 2-4 周申请一次。
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-3">
                  选择复盘方式
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setReviewType('video')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      reviewType === 'video'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-cream-200 hover:border-primary-300'
                    }`}
                  >
                    <Video size={28} className={`mx-auto mb-2 ${reviewType === 'video' ? 'text-primary-500' : 'text-warmgray-400'}`} />
                    <p className={`font-medium ${reviewType === 'video' ? 'text-primary-700' : 'text-warmgray-700'}`}>
                      视频会议
                    </p>
                    <p className="text-xs text-warmgray-500 mt-1">面对面沟通更高效</p>
                  </button>
                  <button
                    onClick={() => setReviewType('voice')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      reviewType === 'voice'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-cream-200 hover:border-primary-300'
                    }`}
                  >
                    <Phone size={28} className={`mx-auto mb-2 ${reviewType === 'voice' ? 'text-primary-500' : 'text-warmgray-400'}`} />
                    <p className={`font-medium ${reviewType === 'voice' ? 'text-primary-700' : 'text-warmgray-700'}`}>
                      语音通话
                    </p>
                    <p className="text-xs text-warmgray-500 mt-1">轻松便捷不露面</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-3">
                  选择日期 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {nextWeekDates.slice(0, 7).map((date) => (
                    <button
                      key={date.value}
                      onClick={() => setPreferredDate(date.value)}
                      className={`p-2 rounded-xl text-center transition-all ${
                        preferredDate === date.value
                          ? 'bg-primary-500 text-white'
                          : 'bg-cream-100 hover:bg-cream-200 text-warmgray-700'
                      }`}
                    >
                      <p className="text-xs opacity-75">{date.weekday}</p>
                      <p className="font-bold">{date.day}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-3">
                  选择时间 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setPreferredTime(time)}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                        preferredTime === time
                          ? 'bg-primary-500 text-white'
                          : 'bg-cream-100 hover:bg-cream-200 text-warmgray-700'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">
                  备注（想讨论的问题）
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="例如：最近进入平台期，希望讨论如何突破..."
                  className="input-field h-24 resize-none"
                />
              </div>

              {preferredDate && preferredTime && (
                <div className="p-4 bg-cream-50 rounded-xl">
                  <p className="text-sm text-warmgray-600">
                    <span className="font-medium">预约信息确认：</span>
                    <br />
                    {preferredDate} {preferredTime} · {reviewType === 'video' ? '视频' : '语音'}复盘
                  </p>
                </div>
              )}

              <button
                onClick={handleCreateReview}
                disabled={!preferredDate || !preferredTime}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Plus size={18} />
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
