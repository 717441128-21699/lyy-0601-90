import { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  FileText,
  Clock,
  MessageCircle,
  Megaphone,
  Check,
  CheckCheck,
  Filter,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useDietStore } from '@/store/useDietStore';
import { formatDateTime, getToday } from '@/utils/date';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '@/types';

const NotificationsPage = () => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
  } = useNotificationStore();
  const { getRecordsByDate } = useDietStore();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'all' | 'system' | 'reminder' | 'report' | 'note' | 'high_risk'>('all');

  const filterOptions = [
    { key: 'all' as const, label: '全部', icon: Bell, count: notifications.length },
    { key: 'system' as const, label: '系统通知', icon: Megaphone, count: notifications.filter(n => n.type === 'system').length },
    { key: 'reminder' as const, label: '补记提醒', icon: Clock, count: notifications.filter(n => n.type === 'reminder').length },
    { key: 'report' as const, label: '报告通知', icon: FileText, count: notifications.filter(n => n.type === 'report').length },
    { key: 'note' as const, label: '营养师留言', icon: MessageCircle, count: notifications.filter(n => n.type === 'note').length },
    { key: 'high_risk' as const, label: '风险提醒', icon: AlertTriangle, count: notifications.filter(n => n.type === 'high_risk').length },
  ];

  const filteredNotifications = activeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeFilter);

  const unreadCount = getUnreadCount();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'high_risk': return AlertTriangle;
      case 'report': return FileText;
      case 'reminder': return Clock;
      case 'note': return MessageCircle;
      case 'system': return Megaphone;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'high_risk': return { bg: 'bg-red-50', border: 'border-red-200', icon: 'bg-red-100 text-red-500' };
      case 'reminder': return { bg: 'bg-accent-50', border: 'border-accent-200', icon: 'bg-accent-100 text-accent-500' };
      case 'report': return { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-100 text-purple-500' };
      case 'note': return { bg: 'bg-primary-50', border: 'border-primary-200', icon: 'bg-primary-100 text-primary-500' };
      case 'system': return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-100 text-blue-500' };
      default: return { bg: 'bg-cream-50', border: 'border-cream-200', icon: 'bg-cream-100 text-warmgray-500' };
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      high_risk: '风险提醒',
      reminder: '补记提醒',
      report: '报告通知',
      note: '营养师留言',
      system: '系统通知',
    };
    return labels[type] || type;
  };

  const handleNotificationClick = (notif: Notification) => {
    markAsRead(notif.id);

    switch (notif.type) {
      case 'high_risk':
        if (notif.relatedRecordId) {
          const todayRecords = getRecordsByDate(getToday());
          const record = todayRecords.find(r => r.id === notif.relatedRecordId);
          if (record) {
            navigate('/diet', { state: { highlightId: notif.relatedRecordId } });
            return;
          }
        }
        navigate('/diet');
        break;
      case 'reminder':
        navigate('/diet');
        break;
      case 'report':
        if (notif.relatedRecordId) {
          navigate('/reports', { state: { highlightReportId: notif.relatedRecordId } });
        } else {
          navigate('/reports');
        }
        break;
      case 'note':
        if (notif.relatedRecordId) {
          navigate('/nutritionist', { state: { highlightNoteId: notif.relatedRecordId } });
        } else {
          navigate('/nutritionist');
        }
        break;
      case 'system':
        navigate('/dashboard');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const getActionText = (type: string) => {
    switch (type) {
      case 'high_risk': return '查看饮食记录';
      case 'reminder': return '去记录';
      case 'report': return '查看报告';
      case 'note': return '查看批注';
      case 'system': return '了解详情';
      default: return '查看';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warmgray-800">通知中心</h1>
          <p className="text-warmgray-500 mt-1">
            {unreadCount > 0 ? `您有 ${unreadCount} 条未读通知` : '暂无未读通知'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="btn-secondary flex items-center gap-2"
          >
            <CheckCheck size={18} />
            全部已读
          </button>
        )}
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-warmgray-500" />
          <span className="text-sm font-medium text-warmgray-700">筛选</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.key}
                onClick={() => setActiveFilter(option.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  activeFilter === option.key
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-cream-100 text-warmgray-600 hover:bg-cream-200'
                }`}
              >
                <Icon size={16} />
                {option.label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  activeFilter === option.key
                    ? 'bg-white/20'
                    : 'bg-white'
                }`}>
                  {option.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="card text-center py-16">
            <Bell size={48} className="mx-auto text-warmgray-300 mb-4" />
            <p className="text-warmgray-500 text-lg">暂无相关通知</p>
            <p className="text-warmgray-400 text-sm mt-1">有新通知时会在这里显示</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const Icon = getNotificationIcon(notif.type);
            const colors = getNotificationColor(notif.type);
            return (
              <div
                key={notif.id}
                className={`card p-0 overflow-hidden ${
                  !notif.read ? `ring-2 ring-primary-200 ${colors.bg}` : ''
                }`}
              >
                <div className="p-5">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-warmgray-800">{notif.title}</h3>
                          {!notif.read && (
                            <span className="w-2 h-2 bg-accent-500 rounded-full flex-shrink-0 animate-pulse" />
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-xs ${colors.bg} ${colors.icon.replace('bg-', 'text-')}`}>
                            {getTypeLabel(notif.type)}
                          </span>
                        </div>
                        <span className="text-xs text-warmgray-400 whitespace-nowrap">
                          {formatDateTime(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-warmgray-600 mt-2 leading-relaxed">{notif.content}</p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-cream-200">
                        <button
                          onClick={() => handleNotificationClick(notif)}
                          className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                        >
                          {getActionText(notif.type)}
                          <ArrowRight size={14} />
                        </button>
                        {!notif.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notif.id);
                            }}
                            className="flex items-center gap-1 text-sm text-warmgray-500 hover:text-warmgray-700 transition-colors"
                          >
                            <Check size={14} />
                            标为已读
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {notifications.length > 0 && (
        <div className="card-gradient bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Megaphone size={20} />
            <h3 className="font-semibold">温馨提示</h3>
          </div>
          <div className="space-y-2 text-sm opacity-90">
            <p>• 请及时查看营养师批注，高风险饮食需要特别注意</p>
            <p>• 补记提醒会在每天 20:00 发送，记得完成当天记录</p>
            <p>• 周报告会在每周一上午生成，请注意查收</p>
            <p>• 您可以随时在设置中调整通知偏好</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
