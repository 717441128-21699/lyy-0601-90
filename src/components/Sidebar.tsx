import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  UtensilsCrossed,
  Dumbbell,
  Scale,
  MessageSquare,
  Trophy,
  FileBarChart,
  Leaf,
  Bell,
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useNotificationStore } from '@/store/useNotificationStore';

const menuItems = [
  { path: '/', label: '营员首页', icon: Home, emoji: '🏠' },
  { path: '/diet', label: '饮食记录', icon: UtensilsCrossed, emoji: '🍎' },
  { path: '/exercise', label: '运动打卡', icon: Dumbbell, emoji: '🏃‍♀️' },
  { path: '/body', label: '体围体重', icon: Scale, emoji: '⚖️' },
  { path: '/nutritionist', label: '营养师批注', icon: MessageSquare, emoji: '💬' },
  { path: '/leaderboard', label: '小组榜单', icon: Trophy, emoji: '🏆' },
  { path: '/reports', label: '报告中心', icon: FileBarChart, emoji: '📊' },
];

const Sidebar = () => {
  const location = useLocation();
  const { user } = useUserStore();
  const { getUnreadCount } = useNotificationStore();
  const unreadCount = getUnreadCount();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg flex flex-col z-30">
      <div className="p-6 border-b border-cream-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white">
            <Leaf size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-warmgray-800">轻享健康</h1>
            <p className="text-xs text-warmgray-500">{user.groupName}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        <div className="px-4 mb-2">
          <p className="text-xs font-medium text-warmgray-400 uppercase tracking-wider">功能导航</p>
        </div>
        
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                      : 'text-warmgray-600 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <Icon size={20} className={isActive ? 'text-white' : 'text-primary-500'} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full" />
                  )}
                </NavLink>
              </li>
            );
          })}
          
          <li className="mt-4 pt-4 border-t border-cream-200">
            <NavLink
              to="/notifications"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                location.pathname === '/notifications'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                  : 'text-warmgray-600 hover:bg-primary-50 hover:text-primary-600'
              }`}
            >
              <span className="text-lg">🔔</span>
              <Bell size={20} className={location.pathname === '/notifications' ? 'text-white' : 'text-primary-500'} />
              <span className="font-medium">通知中心</span>
              {unreadCount > 0 && (
                <span className="ml-auto w-5 h-5 bg-accent-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              {location.pathname === '/notifications' && unreadCount === 0 && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full" />
              )}
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-cream-200">
        <div className="flex items-center gap-3 p-3 bg-cream-100 rounded-xl">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-warmgray-800 truncate">{user.name}</p>
            <p className="text-xs text-warmgray-500">减重进度 {((user.startWeight - user.currentWeight) / (user.startWeight - user.targetWeight) * 100).toFixed(0)}%</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
