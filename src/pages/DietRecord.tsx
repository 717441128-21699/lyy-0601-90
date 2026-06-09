import { useState } from 'react';
import {
  Camera,
  Plus,
  AlertTriangle,
  ChefHat,
  ShoppingCart,
  Trash2,
  Check,
  X,
  Info,
} from 'lucide-react';
import { useDietStore } from '@/store/useDietStore';
import { getMealLabel, getMealEmoji, getToday, formatDateTime } from '@/utils/date';
import { formatCalorieRange } from '@/utils/calories';
import { generateId } from '@/utils/storage';
import type { DietRecord, Recipe } from '@/types';

const mealTypes: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = ['breakfast', 'lunch', 'dinner', 'snack'];

const DietRecordPage = () => {
  const { records, shoppingList, addRecord, toggleShoppingItem, removeShoppingItem } = useDietStore();
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [newMeal, setNewMeal] = useState<{
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    description: string;
    photoUrl: string;
  }>({
    mealType: 'breakfast',
    description: '',
    photoUrl: '',
  });
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');

  const todayRecords = records.filter(r => r.date === selectedDate);
  const historyRecords = records.filter(r => r.date !== selectedDate);
  const highRiskRecords = records.filter(r => r.isHighRisk);

  const todayCalories = todayRecords.reduce((sum, r) => sum + r.calorieRange[0], 0);
  const dailyTarget = 1500;

  const groupedByMeal = mealTypes.map(type => ({
    type,
    records: todayRecords.filter(r => r.mealType === type),
  }));

  const handleAddMeal = () => {
    if (!newMeal.description.trim()) return;
    
    addRecord({
      ...newMeal,
      date: selectedDate,
    });
    
    setNewMeal({
      mealType: 'breakfast',
      description: '',
      photoUrl: '',
    });
    setShowAddModal(false);
  };

  const handlePhotoUpload = () => {
    const photoUrl = `https://picsum.photos/seed/${generateId('photo')}/400/300`;
    setNewMeal({ ...newMeal, photoUrl });
  };

  const shoppingCategories = Array.from(new Set(shoppingList.map(item => item.category)));

  const getStatusColor = (record: DietRecord) => {
    if (record.isHighRisk) return 'border-red-400 bg-red-50';
    if (record.alternativeRecipe) return 'border-primary-400 bg-primary-50';
    return 'border-cream-200 bg-white';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warmgray-800">饮食记录</h1>
          <p className="text-warmgray-500 mt-1">记录每一餐，营养师为您把关</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowShoppingList(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <ShoppingCart size={18} />
            购物清单
            {shoppingList.filter(s => !s.checked).length > 0 && (
              <span className="w-5 h-5 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center">
                {shoppingList.filter(s => !s.checked).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            记录饮食
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-gradient bg-gradient-to-r from-primary-500 to-primary-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold opacity-90">{selectedDate === getToday() ? '今日' : selectedDate} 摄入</h3>
                <p className="text-4xl font-bold mt-2 font-mono">
                  {todayCalories} <span className="text-lg font-normal opacity-75">kcal</span>
                </p>
                <p className="text-sm opacity-75 mt-1">
                  目标 {dailyTarget} kcal · 还可摄入 {Math.max(dailyTarget - todayCalories, 0)} kcal
                </p>
              </div>
              <div className="w-24 h-24">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="12"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="white"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 * (1 - Math.min(todayCalories / dailyTarget, 1))}
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-cream-200">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'today' ? 'text-primary-600' : 'text-warmgray-500 hover:text-warmgray-700'
              }`}
            >
              今日记录
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
            <div className="space-y-6">
              {groupedByMeal.map(({ type, records }) => (
                <div key={type} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getMealEmoji(type)}</span>
                    <h3 className="font-semibold text-warmgray-800">{getMealLabel(type)}</h3>
                    {records.length > 0 && (
                      <span className="tag tag-success">
                        {records.reduce((sum, r) => sum + r.calorieRange[0], 0)} kcal
                      </span>
                    )}
                  </div>
                  
                  {records.length === 0 ? (
                    <div
                      onClick={() => {
                        setNewMeal({ ...newMeal, mealType: type });
                        setShowAddModal(true);
                      }}
                      className="p-8 border-2 border-dashed border-cream-300 rounded-2xl text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all"
                    >
                      <Camera size={32} className="mx-auto text-warmgray-400 mb-2" />
                      <p className="text-warmgray-500">点击记录{getMealLabel(type)}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {records.map((record) => (
                        <div
                          key={record.id}
                          className={`p-4 rounded-2xl border-2 transition-all ${getStatusColor(record)}`}
                        >
                          <div className="flex gap-4">
                            {record.photoUrl ? (
                              <img
                                src={record.photoUrl}
                                alt={record.description}
                                className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-24 h-24 rounded-xl bg-cream-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-4xl">{getMealEmoji(type)}</span>
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-medium text-warmgray-800">{record.description}</p>
                                  <p className="text-sm text-warmgray-500 mt-1">
                                    {formatCalorieRange(record.calorieRange)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  {record.isHighRisk && (
                                    <span className="tag tag-danger flex items-center gap-1">
                                      <AlertTriangle size={12} />
                                      高风险
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {record.isHighRisk && record.riskReason && (
                                <div className="mt-3 p-3 bg-red-100 rounded-xl">
                                  <p className="text-sm text-red-700 flex items-start gap-2">
                                    <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                                    <span>{record.riskReason}</span>
                                  </p>
                                </div>
                              )}
                              
                              {record.alternativeRecipe && (
                                <div className="mt-3 p-3 bg-primary-100 rounded-xl">
                                  <div className="flex items-center gap-2 mb-2">
                                    <ChefHat size={16} className="text-primary-600" />
                                    <p className="font-medium text-primary-700">推荐替代食谱</p>
                                  </div>
                                  <p className="font-medium text-warmgray-800">{record.alternativeRecipe.name}</p>
                                  <p className="text-sm text-warmgray-500 mt-1">
                                    {record.alternativeRecipe.calories} kcal
                                  </p>
                                  <p className="text-sm text-warmgray-600 mt-2 line-clamp-2">
                                    {record.alternativeRecipe.instructions}
                                  </p>
                                </div>
                              )}
                              
                              <p className="text-xs text-warmgray-400 mt-2">
                                {formatDateTime(record.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {historyRecords.length === 0 ? (
                <div className="text-center py-12 text-warmgray-400">
                  暂无历史记录
                </div>
              ) : (
                historyRecords.slice(0, 20).map((record) => (
                  <div
                    key={record.id}
                    className={`p-4 rounded-2xl border-2 transition-all ${getStatusColor(record)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getMealEmoji(record.mealType)}</span>
                        <div>
                          <p className="font-medium text-warmgray-800">{record.description}</p>
                          <p className="text-sm text-warmgray-500">
                            {record.date} · {getMealLabel(record.mealType)} · {formatCalorieRange(record.calorieRange)}
                          </p>
                        </div>
                      </div>
                      {record.isHighRisk && (
                        <AlertTriangle size={20} className="text-red-500" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {highRiskRecords.length > 0 && (
            <div className="card border-2 border-red-200">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={20} className="text-red-500" />
                <h3 className="font-semibold text-warmgray-800">高风险提醒</h3>
                <span className="tag tag-danger ml-auto">{highRiskRecords.length}</span>
              </div>
              <div className="space-y-3">
                {highRiskRecords.slice(0, 3).map((record) => (
                  <div key={record.id} className="p-3 bg-red-50 rounded-xl">
                    <p className="text-sm font-medium text-red-700">
                      {getMealLabel(record.mealType)}: {record.description}
                    </p>
                    <p className="text-xs text-red-600 mt-1">{record.riskReason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="font-semibold text-warmgray-800 mb-4">热量建议</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-cream-100 rounded-xl">
                <span className="text-warmgray-600">早餐建议</span>
                <span className="font-mono font-semibold text-warmgray-800">300-400 kcal</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-cream-100 rounded-xl">
                <span className="text-warmgray-600">午餐建议</span>
                <span className="font-mono font-semibold text-warmgray-800">500-600 kcal</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-cream-100 rounded-xl">
                <span className="text-warmgray-600">晚餐建议</span>
                <span className="font-mono font-semibold text-warmgray-800">400-500 kcal</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-cream-100 rounded-xl">
                <span className="text-warmgray-600">加餐建议</span>
                <span className="font-mono font-semibold text-warmgray-800">100-200 kcal</span>
              </div>
            </div>
          </div>

          <div className="card-gradient bg-gradient-to-br from-accent-500 to-accent-600 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Info size={20} />
              <h3 className="font-semibold">营养师小贴士</h3>
            </div>
            <p className="text-sm opacity-90">
              每餐建议搭配：1/4蛋白质 + 1/4主食 + 1/2蔬菜。
              细嚼慢咽，每口饭咀嚼20次以上，有助于控制食量。
              记得每天喝够2000ml水哦！💧
            </p>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-bounce-soft">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-warmgray-800">记录饮食</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-cream-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">餐次</label>
                <div className="grid grid-cols-4 gap-2">
                  {mealTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewMeal({ ...newMeal, mealType: type })}
                      className={`p-3 rounded-xl text-center transition-all ${
                        newMeal.mealType === type
                          ? 'bg-primary-500 text-white shadow-lg'
                          : 'bg-cream-100 text-warmgray-600 hover:bg-cream-200'
                      }`}
                    >
                      <span className="text-xl block mb-1">{getMealEmoji(type)}</span>
                      <span className="text-xs">{getMealLabel(type)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">拍照记录</label>
                <div
                  onClick={handlePhotoUpload}
                  className="border-2 border-dashed border-cream-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all"
                >
                  {newMeal.photoUrl ? (
                    <div className="relative">
                      <img
                        src={newMeal.photoUrl}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-xl"
                      />
                      <p className="text-sm text-primary-600 mt-2">点击重新拍摄</p>
                    </div>
                  ) : (
                    <>
                      <Camera size={32} className="mx-auto text-warmgray-400 mb-2" />
                      <p className="text-warmgray-500">点击拍照或上传照片</p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">食物描述</label>
                <textarea
                  value={newMeal.description}
                  onChange={(e) => setNewMeal({ ...newMeal, description: e.target.value })}
                  placeholder="例如：糙米饭 + 鸡胸肉 + 西兰花"
                  className="input-field h-24 resize-none"
                />
                <p className="text-xs text-warmgray-400 mt-2">
                  系统将根据描述估算热量区间
                </p>
              </div>

              <button
                onClick={handleAddMeal}
                disabled={!newMeal.description.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                保存记录
              </button>
            </div>
          </div>
        </div>
      )}

      {showShoppingList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[80vh] flex flex-col animate-bounce-soft">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-warmgray-800 flex items-center gap-2">
                <ShoppingCart size={22} />
                购物清单
              </h3>
              <button
                onClick={() => setShowShoppingList(false)}
                className="p-2 hover:bg-cream-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4">
              {shoppingCategories.map((category) => {
                const items = shoppingList.filter(item => item.category === category);
                return (
                  <div key={category}>
                    <h4 className="font-medium text-warmgray-600 mb-2 px-2">{category}</h4>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                            item.checked ? 'bg-cream-100 opacity-60' : 'bg-cream-50 hover:bg-cream-100'
                          }`}
                        >
                          <button
                            onClick={() => toggleShoppingItem(item.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              item.checked
                                ? 'bg-primary-500 border-primary-500 text-white'
                                : 'border-cream-300 hover:border-primary-500'
                            }`}
                          >
                            {item.checked && <Check size={14} />}
                          </button>
                          <div className="flex-1">
                            <span className={item.checked ? 'line-through text-warmgray-400' : 'text-warmgray-700'}>
                              {item.name}
                            </span>
                            <span className="text-sm text-warmgray-400 ml-2">{item.quantity}</span>
                          </div>
                          <button
                            onClick={() => removeShoppingItem(item.id)}
                            className="p-1 text-warmgray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {shoppingList.length === 0 && (
                <div className="text-center py-12 text-warmgray-400">
                  <ShoppingCart size={40} className="mx-auto mb-2 opacity-50" />
                  <p>购物清单为空</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-cream-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-warmgray-500">
                  已完成 {shoppingList.filter(s => s.checked).length} / {shoppingList.length}
                </span>
                <span className="text-warmgray-500">
                  营养师为您推荐
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietRecordPage;
