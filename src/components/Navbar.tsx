import { useState, useEffect, useRef } from 'react';
import { Bell, Search, Calendar, ChevronDown, X } from 'lucide-react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { formatDateTime } from '@/utils/date';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { notifications, getUnreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = getUnreadCount();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'high_risk': return '⚠️';
      case 'report': return '📊';
      case 'reminder': return '⏰';
      case 'note': return '💬';
      default: return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'high_risk': return 'bg-red-50 border-red-200';
      case 'reminder': return 'bg-accent-50 border-accent-200';
      default: return 'bg-cream-50 border-cream-200';
    }
  };

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markAsRead(notif.id);
    setShowNotifications(false);
    
    if (notif.type === 'high_risk' || notif.type === 'note') {
      navigate('/nutritionist');
    } else if (notif.type === 'report') {
      navigate('/reports');
    } else if (notif.type === 'reminder') {
      navigate('/diet');
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-cream-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-cream-100 rounded-xl">
            <Calendar size={18} className="text-primary-500" />
            <span className="text-sm text-warmgray-600">
              {formatDateTime(new Date())}
            </span>
          </div>
          
          <div className="relative hidden lg:block">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-warmgray-400" />
            <input
              type="text"
              placeholder="搜索记录..."
              className="w-64 pl-10 pr-4 py-2 bg-cream-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl hover:bg-cream-100 transition-colors"
            >
              <Bell size={22} className="text-warmgray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce-soft">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-card-hover border border-cream-200 overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-cream-200">
                  <h3 className="font-semibold text-warmgray-800">通知中心</h3>
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    全部已读
                  </button>
                </div>
                
                <div className="max-h-96 overflow-y-auto scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-warmgray-400">
                      暂无通知
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 border-b border-cream-100 cursor-pointer transition-colors hover:bg-cream-50 ${
                          !notif.read ? getNotificationColor(notif.type) : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <span className="text-2xl">{getNotificationIcon(notif.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-warmgray-800 truncate">{notif.title}</h4>
                              {!notif.read && (
                                <span className="w-2 h-2 bg-accent-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-warmgray-500 line-clamp-2 mt-0.5">
                              {notif.content}
                            </p>
                            <p className="text-xs text-warmgray-400 mt-1">
                              {formatDateTime(notif.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-3 border-t border-cream-200">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/nutritionist');
                    }}
                    className="w-full py-2 text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    查看全部通知
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
