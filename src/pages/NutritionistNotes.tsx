import { useState } from 'react';
import {
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Send,
  X,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Filter,
  Reply,
  Zap,
} from 'lucide-react';
import { useNoteStore } from '@/store/useNoteStore';
import { useDietStore } from '@/store/useDietStore';
import { formatDateTime, getMealLabel } from '@/utils/date';

const NutritionistNotesPage = () => {
  const { notes, todos, replyToNote, toggleTodo, getUnreadCount, getHighRiskCount } = useNoteStore();
  const { records: dietRecords } = useDietStore();
  const [activeTab, setActiveTab] = useState<'all' | 'highRisk' | 'unread'>('all');
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [todoTitle, setTodoTitle] = useState('');
  const [todoDesc, setTodoDesc] = useState('');
  const [todoType, setTodoType] = useState<'diet' | 'exercise' | 'weight' | 'note'>('diet');

  const filteredNotes = notes.filter(note => {
    if (activeTab === 'highRisk') return note.isHighRisk;
    if (activeTab === 'unread') return !note.reply;
    return true;
  });

  const getRelatedRecord = (note: typeof notes[0]) => {
    if (note.relatedRecordType === 'diet' && note.relatedRecordId) {
      return dietRecords.find(r => r.id === note.relatedRecordId);
    }
    return null;
  };

  const handleReply = (noteId: string) => {
    const content = replyContent[noteId];
    if (content?.trim()) {
      replyToNote(noteId, content.trim());
      setReplyContent(prev => ({ ...prev, [noteId]: '' }));
    }
  };

  const pendingTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      diet: '🍽️',
      exercise: '🏃‍♀️',
      weight: '⚖️',
      note: '📝',
    };
    return icons[type] || '📋';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      diet: '饮食',
      exercise: '运动',
      weight: '体重',
      note: '批注',
    };
    return labels[type] || type;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-100 text-red-600',
      medium: 'bg-accent-100 text-accent-600',
      low: 'bg-primary-100 text-primary-600',
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      high: '高优先级',
      medium: '中优先级',
      low: '低优先级',
    };
    return labels[priority] || priority;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warmgray-800">营养师批注</h1>
          <p className="text-warmgray-500 mt-1">与营养师互动，获取专业指导</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-cream-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-warmgray-500 hover:text-warmgray-700'
              }`}
            >
              全部 ({notes.length})
            </button>
            <button
              onClick={() => setActiveTab('highRisk')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
                activeTab === 'highRisk'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-warmgray-500 hover:text-warmgray-700'
              }`}
            >
              <AlertTriangle size={14} />
              高风险 ({getHighRiskCount()})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'unread'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-warmgray-500 hover:text-warmgray-700'
              }`}
            >
              待回复 ({getUnreadCount()})
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="card-gradient bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono">{notes.length}</p>
                  <p className="text-sm opacity-75">总批注数</p>
                </div>
              </div>
            </div>
            <div className="card-gradient bg-gradient-to-br from-red-500 to-red-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono">{getHighRiskCount()}</p>
                  <p className="text-sm opacity-75">高风险提醒</p>
                </div>
              </div>
            </div>
            <div className="card-gradient bg-gradient-to-br from-accent-500 to-accent-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono">{notes.length - getUnreadCount()}</p>
                  <p className="text-sm opacity-75">已回复</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredNotes.length === 0 ? (
              <div className="card text-center py-12">
                <MessageCircle size={48} className="mx-auto text-warmgray-300 mb-3" />
                <p className="text-warmgray-500 text-lg">暂无相关批注</p>
                <p className="text-warmgray-400 text-sm mt-1">营养师会根据您的记录给出专业建议</p>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const relatedRecord = getRelatedRecord(note);
                const isExpanded = expandedNote === note.id;
                return (
                  <div
                    key={note.id}
                    className={`card ${note.isHighRisk ? 'border-red-200 bg-red-50/30' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={note.nutritionistAvatar}
                        alt={note.nutritionistName}
                        className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-warmgray-800">{note.nutritionistName}</span>
                          {note.isHighRisk && (
                            <span className="tag tag-error flex items-center gap-1">
                              <AlertTriangle size={12} />
                              高风险
                            </span>
                          )}
                          {note.reply && (
                            <span className="tag tag-success flex items-center gap-1">
                              <CheckCircle size={12} />
                              已回复
                            </span>
                          )}
                        </div>
                        <p className="text-warmgray-700 leading-relaxed">{note.content}</p>

                        {relatedRecord && (
                          <div className="mt-3 p-3 bg-cream-100 rounded-xl">
                            <div className="flex items-center gap-2 text-sm text-warmgray-500 mb-1">
                              <span>📎 相关记录</span>
                              <span>·</span>
                              <span>{getMealLabel(relatedRecord.mealType)}</span>
                            </div>
                            <p className="text-warmgray-700">{relatedRecord.description}</p>
                            {relatedRecord.isHighRisk && (
                              <p className="text-sm text-red-500 mt-1">⚠️ {relatedRecord.riskReason}</p>
                            )}
                            {relatedRecord.alternativeRecipe && (
                              <div className="mt-2 p-2 bg-primary-50 rounded-lg">
                                <p className="text-sm font-medium text-primary-700 mb-1">
                                  🍳 替代食谱：{relatedRecord.alternativeRecipe.name}
                                </p>
                                <p className="text-xs text-primary-600">
                                  {relatedRecord.alternativeRecipe.calories} kcal
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {note.reply && (
                          <div className="mt-3 p-3 bg-primary-50 rounded-xl border-l-4 border-primary-500">
                            <div className="flex items-center gap-2 text-sm text-primary-600 mb-1">
                              <Reply size={14} />
                              <span>我的回复</span>
                              <span>·</span>
                              <span>{formatDateTime(note.replyAt!)}</span>
                            </div>
                            <p className="text-primary-700">{note.reply}</p>
                          </div>
                        )}

                        {!note.reply && (
                          <div className="mt-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={replyContent[note.id] || ''}
                                onChange={(e) => setReplyContent(prev => ({
                                  ...prev,
                                  [note.id]: e.target.value
                                }))}
                                placeholder="输入回复..."
                                className="input-field flex-1"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleReply(note.id);
                                }}
                              />
                              <button
                                onClick={() => handleReply(note.id)}
                                disabled={!replyContent[note.id]?.trim()}
                                className="btn-primary px-4 py-2.5 flex items-center gap-2 disabled:opacity-50"
                              >
                                <Send size={16} />
                                回复
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-cream-200">
                          <div className="flex items-center gap-2 text-sm text-warmgray-400">
                            <Clock size={14} />
                            <span>{formatDateTime(note.createdAt)}</span>
                          </div>
                          <button
                            onClick={() => setExpandedNote(isExpanded ? null : note.id)}
                            className="flex items-center gap-1 text-sm text-warmgray-500 hover:text-warmgray-700"
                          >
                            {isExpanded ? (
                              <>
                                收起 <ChevronUp size={14} />
                              </>
                            ) : (
                              <>
                                查看详情 <ChevronDown size={14} />
                              </>
                            )}
                          </button>
                        </div>

                        {isExpanded && relatedRecord?.alternativeRecipe && (
                          <div className="mt-4 p-4 bg-white rounded-xl border border-cream-200">
                            <h4 className="font-semibold text-warmgray-800 mb-3">
                              📋 替代食谱详情
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-warmgray-600">食谱名称</span>
                                <span className="font-medium text-primary-600">
                                  {relatedRecord.alternativeRecipe.name}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-warmgray-600">热量</span>
                                <span className="font-medium text-accent-600">
                                  {relatedRecord.alternativeRecipe.calories} kcal
                                </span>
                              </div>
                              <div>
                                <span className="text-warmgray-600 block mb-2">所需食材</span>
                                <div className="flex flex-wrap gap-2">
                                  {relatedRecord.alternativeRecipe.ingredients.map((ing, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-cream-100 rounded-lg text-sm text-warmgray-700"
                                    >
                                      {ing.name} {ing.amount}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="text-warmgray-600 block mb-2">制作步骤</span>
                                <p className="text-sm text-warmgray-700 leading-relaxed">
                                  {relatedRecord.alternativeRecipe.instructions}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-warmgray-800">今日待办</h3>
              <button
                onClick={() => setShowTodoModal(true)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + 添加
              </button>
            </div>

            {pendingTodos.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-xs text-warmgray-500 font-medium">待完成 ({pendingTodos.length})</p>
                {pendingTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="p-3 bg-cream-50 rounded-xl hover:bg-cream-100 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className="w-5 h-5 mt-0.5 rounded-full border-2 border-warmgray-300 hover:border-primary-500 flex items-center justify-center flex-shrink-0 transition-colors"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span>{getTypeIcon(todo.type)}</span>
                          <span className="font-medium text-warmgray-800">{todo.title}</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${getPriorityColor(todo.priority)}`}>
                            {getPriorityLabel(todo.priority)}
                          </span>
                        </div>
                        <p className="text-sm text-warmgray-500 mt-1 truncate">{todo.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-warmgray-400">
                          <span>{getTypeLabel(todo.type)}</span>
                          <span>·</span>
                          <span>截止 {todo.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {completedTodos.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-warmgray-500 font-medium">已完成 ({completedTodos.length})</p>
                {completedTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="p-3 bg-cream-50/50 rounded-xl opacity-60"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className="w-5 h-5 mt-0.5 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0"
                      >
                        <CheckCircle size={12} className="text-white" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span>{getTypeIcon(todo.type)}</span>
                          <span className="font-medium text-warmgray-500 line-through">{todo.title}</span>
                        </div>
                        <p className="text-sm text-warmgray-400 mt-1 line-through">{todo.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pendingTodos.length === 0 && completedTodos.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle size={36} className="mx-auto text-warmgray-300 mb-2" />
                <p className="text-warmgray-500 text-sm">暂无待办事项</p>
              </div>
            )}
          </div>

          <div className="card-gradient bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={20} />
              <h3 className="font-semibold">营养师建议</h3>
            </div>
            <div className="space-y-3 text-sm opacity-90">
              <p className="flex items-start gap-2">
                <span className="text-lg">🥗</span>
                <span>每天保证摄入 300-500g 蔬菜，深色蔬菜占一半以上</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-lg">💧</span>
                <span>每天饮水 1500-2000ml，分次小口饮用</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-lg">😴</span>
                <span>保证每晚 7-8 小时睡眠，有利于体重管理</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-lg">📱</span>
                <span>有任何问题随时留言，营养师会在 24 小时内回复</span>
              </p>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-warmgray-800">王营养师</h3>
                <p className="text-sm text-warmgray-500">注册营养师 · 从业 8 年</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-cream-50 rounded-xl text-center">
                <p className="text-lg font-bold text-primary-600 font-mono">128</p>
                <p className="text-xs text-warmgray-500">服务学员</p>
              </div>
              <div className="p-3 bg-cream-50 rounded-xl text-center">
                <p className="text-lg font-bold text-accent-600 font-mono">98%</p>
                <p className="text-xs text-warmgray-500">满意度</p>
              </div>
            </div>
            <p className="text-sm text-warmgray-500 mt-3">
              擅长：体重管理、糖尿病饮食、高血压饮食、儿童营养
            </p>
          </div>
        </div>
      </div>

      {showTodoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-bounce-soft">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-warmgray-800">添加待办</h3>
              <button
                onClick={() => setShowTodoModal(false)}
                className="p-2 hover:bg-cream-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">
                  标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={todoTitle}
                  onChange={(e) => setTodoTitle(e.target.value)}
                  placeholder="例如：记录午餐"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">
                  描述
                </label>
                <textarea
                  value={todoDesc}
                  onChange={(e) => setTodoDesc(e.target.value)}
                  placeholder="详细描述..."
                  className="input-field h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">
                  类型
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['diet', 'exercise', 'weight', 'note'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setTodoType(type)}
                      className={`p-3 rounded-xl text-center transition-all ${
                        todoType === type
                          ? 'bg-primary-100 border-2 border-primary-500'
                          : 'bg-cream-100 border-2 border-transparent hover:bg-cream-200'
                      }`}
                    >
                      <span className="text-xl block mb-1">{getTypeIcon(type)}</span>
                      <span className="text-xs text-warmgray-600">{getTypeLabel(type)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (todoTitle.trim()) {
                    // 使用 addTodo 方法
                    const { addTodo } = useNoteStore.getState();
                    addTodo({
                      title: todoTitle.trim(),
                      description: todoDesc.trim() || todoTitle.trim(),
                      type: todoType,
                      dueDate: new Date().toISOString().split('T')[0],
                      priority: 'medium',
                    });
                    setTodoTitle('');
                    setTodoDesc('');
                    setTodoType('diet');
                    setShowTodoModal(false);
                  }
                }}
                disabled={!todoTitle.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle size={18} />
                添加待办
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionistNotesPage;
