import { useState, useEffect } from 'react';
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
  CheckCircle,
  ShoppingBag,
  Edit3,
  Save,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Gauge,
} from 'lucide-react';
import { useDietStore } from '@/store/useDietStore';
import { getMealLabel, getMealEmoji, getToday, formatDateTime } from '@/utils/date';
import { formatCalorieRange } from '@/utils/calories';
import { generateId } from '@/utils/storage';
import type { DietRecord, Recipe } from '@/types';
import { useLocation } from 'react-router-dom';

const mealTypes: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = ['breakfast', 'lunch', 'dinner', 'snack'];

const DietRecordPage = () => {
  const { 
    records, 
    shoppingList, 
    showCompletedItems,
    addRecord, 
    toggleShoppingItem, 
    removeShoppingItem, 
    addRecipeIngredients,
    updateRiskLevel,
    updateNutritionistNote,
    updateAlternativeRecipe,
    toggleShowCompletedItems,
    clearCompletedItems,
    getShoppingListByRecipe,
  } = useDietStore();
  const location = useLocation();
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    riskLevel: 'low' | 'medium' | 'high';
    riskReason: string;
    nutritionistNote: string;
    recipe: Recipe;
  } | null>(null);
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

  useEffect(() => {
    if (location.state?.highlightId) {
      setHighlightId(location.state.highlightId);
      const record = records.find(r => r.id === location.state.highlightId);
      if (record) {
        setSelectedDate(record.date);
        setActiveTab(record.date === getToday() ? 'today' : 'history');
        setExpandedRecipeId(record.id);
        setTimeout(() => {
          const element = document.getElementById(`record-${location.state.highlightId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        setTimeout(() => setHighlightId(null), 3000);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state, records]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

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
    
    const result = addRecord({
      ...newMeal,
      date: selectedDate,
    });
    
    if (result.wasHighRisk) {
      showSuccess(`已记录，系统检测到「${newMeal.description}」可能为高风险食物，已为您推荐替代食谱`);
    } else {
      showSuccess(`「${newMeal.description}」已记录，继续保持！`);
    }
    
    setNewMeal({
      mealType: 'breakfast',
      description: '',
      photoUrl: '',
    });
    setShowAddModal(false);
  };

  const handleAddRecipeToShopping = (recipe: Recipe, recordId: string) => {
    const addedCount = addRecipeIngredients(recipe, recordId);
    if (addedCount > 0) {
      showSuccess(`已将「${recipe.name}」的 ${addedCount} 种食材添加到购物清单`);
    } else {
      showSuccess(`「${recipe.name}」的食材已在购物清单中`);
    }
  };

  const handlePhotoUpload = () => {
    const photoUrl = `https://picsum.photos/seed/${generateId('photo')}/400/300`;
    setNewMeal({ ...newMeal, photoUrl });
  };

  const startEditing = (record: DietRecord) => {
    setEditingRecordId(record.id);
    setEditForm({
      riskLevel: record.riskLevel || (record.isHighRisk ? 'high' : 'low'),
      riskReason: record.riskReason || '',
      nutritionistNote: record.nutritionistNote || '',
      recipe: record.alternativeRecipe || {
        id: generateId('recipe'),
        name: '',
        ingredients: [],
        calories: 0,
        instructions: '',
      },
    });
  };

  const cancelEditing = () => {
    setEditingRecordId(null);
    setEditForm(null);
  };

  const saveEditing = (recordId: string) => {
    if (!editForm) return;
    
    updateRiskLevel(recordId, editForm.riskLevel, editForm.riskReason);
    updateNutritionistNote(recordId, editForm.nutritionistNote);
    if (editForm.recipe.name) {
      updateAlternativeRecipe(recordId, editForm.recipe);
    }
    
    setEditingRecordId(null);
    setEditForm(null);
    showSuccess('已保存营养师批注和风险等级调整');
  };

  const addRecipeIngredient = () => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      recipe: {
        ...editForm.recipe,
        ingredients: [...editForm.recipe.ingredients, { name: '', amount: '' }],
      },
    });
  };

  const removeRecipeIngredient = (index: number) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      recipe: {
        ...editForm.recipe,
        ingredients: editForm.recipe.ingredients.filter((_, i) => i !== index),
      },
    });
  };

  const updateRecipeIngredient = (index: number, field: 'name' | 'amount', value: string) => {
    if (!editForm) return;
    const newIngredients = [...editForm.recipe.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setEditForm({
      ...editForm,
      recipe: {
        ...editForm.recipe,
        ingredients: newIngredients,
      },
    });
  };

  const shoppingCategories = Array.from(new Set(shoppingList.map(item => item.category)));
  const shoppingByRecipe = getShoppingListByRecipe();

  const getStatusColor = (record: DietRecord) => {
    if (record.riskLevel === 'high') return 'border-red-400 bg-red-50';
    if (record.riskLevel === 'medium') return 'border-orange-400 bg-orange-50';
    if (record.alternativeRecipe) return 'border-primary-400 bg-primary-50';
    return 'border-cream-200 bg-white';
  };

  const getRiskLevelLabel = (level?: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high': return { label: '高风险', className: 'tag-danger' };
      case 'medium': return { label: '中风险', className: 'tag-warning' };
      case 'low': return { label: '低风险', className: 'tag-success' };
      default: return null;
    }
  };

  const getRiskLevelColor = (level?: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-warmgray-600 bg-warmgray-100';
    }
  };

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
                          id={`record-${record.id}`}
                          className={`p-4 rounded-2xl border-2 transition-all ${getStatusColor(record)} ${
                            highlightId === record.id ? 'ring-4 ring-primary-300 ring-opacity-75 animate-pulse' : ''
                          }`}
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
                                  {getRiskLevelLabel(record.riskLevel) && (
                                    <span className={`tag ${getRiskLevelLabel(record.riskLevel)!.className} flex items-center gap-1`}>
                                      <AlertTriangle size={12} />
                                      {getRiskLevelLabel(record.riskLevel)!.label}
                                    </span>
                                  )}
                                  {record.riskModifiedBy === 'nutritionist' && (
                                    <span className="tag tag-info flex items-center gap-1">
                                      <span>👨‍⚕️</span>
                                      营养师已审核
                                    </span>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEditing(record);
                                    }}
                                    className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                                    title="营养师处理"
                                  >
                                    <Edit3 size={14} className="text-warmgray-500" />
                                  </button>
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
                              
                              {record.nutritionistNote && (
                                <div className="mt-3 p-3 bg-blue-100 rounded-xl">
                                  <p className="text-sm text-blue-700 flex items-start gap-2">
                                    <MessageSquare size={16} className="flex-shrink-0 mt-0.5" />
                                    <span>
                                      <strong>营养师批注：</strong>{record.nutritionistNote}
                                    </span>
                                  </p>
                                </div>
                              )}
                              
                              {record.alternativeRecipe && (
                                <div className="mt-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedRecipeId(expandedRecipeId === record.id ? null : record.id);
                                    }}
                                    className="w-full p-3 bg-primary-100 rounded-xl flex items-center justify-between hover:bg-primary-200 transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      <ChefHat size={16} className="text-primary-600" />
                                      <p className="font-medium text-primary-700">推荐替代食谱：{record.alternativeRecipe.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAddRecipeToShopping(record.alternativeRecipe!, record.id);
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-white text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors shadow-sm"
                                      >
                                        <ShoppingBag size={14} />
                                        加入购物清单
                                      </button>
                                      {expandedRecipeId === record.id ? (
                                        <ChevronUp size={18} className="text-primary-600" />
                                      ) : (
                                        <ChevronDown size={18} className="text-primary-600" />
                                      )}
                                    </div>
                                  </button>
                                  
                                  {expandedRecipeId === record.id && (
                                    <div className="p-4 bg-primary-50 rounded-b-xl border-x border-b border-primary-200 animate-fade-in">
                                      <div className="flex items-center justify-between mb-3">
                                        <p className="font-medium text-warmgray-800">{record.alternativeRecipe.name}</p>
                                        <span className="text-sm text-primary-600 font-medium">
                                          {record.alternativeRecipe.calories} kcal
                                        </span>
                                      </div>
                                      <div className="mb-3">
                                        <p className="text-sm text-warmgray-600 mb-1">所需食材：</p>
                                        <div className="flex flex-wrap gap-1.5">
                                          {record.alternativeRecipe.ingredients.map((ing, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-white rounded-full text-xs text-warmgray-600">
                                              {ing.name} {ing.amount}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                      {record.alternativeRecipe.instructions && (
                                        <div>
                                          <p className="text-sm text-warmgray-600 mb-1">制作步骤：</p>
                                          <p className="text-sm text-warmgray-700">{record.alternativeRecipe.instructions}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <p className="text-xs text-warmgray-400 mt-2">
                                {formatDateTime(record.createdAt)}
                              </p>
                              
                              {editingRecordId === record.id && editForm && (
                                <div className="mt-4 p-4 bg-white rounded-xl border-2 border-primary-200 animate-fade-in">
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-warmgray-800 flex items-center gap-2">
                                      <Gauge size={18} className="text-primary-500" />
                                      营养师处理
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          saveEditing(record.id);
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                                      >
                                        <Save size={14} />
                                        保存
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          cancelEditing();
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-warmgray-100 text-warmgray-600 rounded-lg text-sm font-medium hover:bg-warmgray-200 transition-colors"
                                      >
                                        <X size={14} />
                                        取消
                                      </button>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-warmgray-700 mb-2">
                                        风险等级
                                      </label>
                                      <div className="grid grid-cols-3 gap-2">
                                        {(['low', 'medium', 'high'] as const).map((level) => (
                                          <button
                                            key={level}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditForm({ ...editForm, riskLevel: level });
                                            }}
                                            className={`p-2 rounded-lg text-sm font-medium transition-all ${
                                              editForm.riskLevel === level
                                                ? getRiskLevelColor(level) + ' ring-2 ring-offset-2 ring-opacity-50'
                                                : 'bg-warmgray-50 text-warmgray-600 hover:bg-warmgray-100'
                                            }`}
                                          >
                                            {level === 'low' ? '低风险' : level === 'medium' ? '中风险' : '高风险'}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <label className="block text-sm font-medium text-warmgray-700 mb-2">
                                        风险原因
                                      </label>
                                      <textarea
                                        onClick={(e) => e.stopPropagation()}
                                        value={editForm.riskReason}
                                        onChange={(e) => setEditForm({ ...editForm, riskReason: e.target.value })}
                                        placeholder="请输入风险原因..."
                                        className="input-field w-full h-20 resize-none"
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="block text-sm font-medium text-warmgray-700 mb-2">
                                        营养师批注
                                      </label>
                                      <textarea
                                        onClick={(e) => e.stopPropagation()}
                                        value={editForm.nutritionistNote}
                                        onChange={(e) => setEditForm({ ...editForm, nutritionistNote: e.target.value })}
                                        placeholder="请输入营养师批注..."
                                        className="input-field w-full h-20 resize-none"
                                      />
                                    </div>
                                    
                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-warmgray-700">
                                          替代食谱
                                        </label>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            addRecipeIngredient();
                                          }}
                                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                        >
                                          + 添加食材
                                        </button>
                                      </div>
                                      <div className="space-y-2">
                                        <input
                                          onClick={(e) => e.stopPropagation()}
                                          value={editForm.recipe.name}
                                          onChange={(e) => setEditForm({ ...editForm, recipe: { ...editForm.recipe, name: e.target.value } })}
                                          placeholder="食谱名称"
                                          className="input-field w-full"
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                          <input
                                            onClick={(e) => e.stopPropagation()}
                                            type="number"
                                            value={editForm.recipe.calories || ''}
                                            onChange={(e) => setEditForm({ ...editForm, recipe: { ...editForm.recipe, calories: parseInt(e.target.value) || 0 } })}
                                            placeholder="热量 (kcal)"
                                            className="input-field"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          {editForm.recipe.ingredients.map((ing, idx) => (
                                            <div key={idx} className="flex gap-2">
                                              <input
                                                onClick={(e) => e.stopPropagation()}
                                                value={ing.name}
                                                onChange={(e) => updateRecipeIngredient(idx, 'name', e.target.value)}
                                                placeholder="食材名称"
                                                className="input-field flex-1"
                                              />
                                              <input
                                                onClick={(e) => e.stopPropagation()}
                                                value={ing.amount}
                                                onChange={(e) => updateRecipeIngredient(idx, 'amount', e.target.value)}
                                                placeholder="用量"
                                                className="input-field w-28"
                                              />
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  removeRecipeIngredient(idx);
                                                }}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                              >
                                                <Trash2 size={16} />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                        <textarea
                                          onClick={(e) => e.stopPropagation()}
                                          value={editForm.recipe.instructions}
                                          onChange={(e) => setEditForm({ ...editForm, recipe: { ...editForm.recipe, instructions: e.target.value } })}
                                          placeholder="制作步骤..."
                                          className="input-field w-full h-20 resize-none"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
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
                    id={`record-${record.id}`}
                    className={`p-4 rounded-2xl border-2 transition-all ${getStatusColor(record)} ${
                      highlightId === record.id ? 'ring-4 ring-primary-300 ring-opacity-75 animate-pulse' : ''
                    }`}
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
                      <div className="flex items-center gap-2">
                        {getRiskLevelLabel(record.riskLevel) && (
                          <span className={`tag ${getRiskLevelLabel(record.riskLevel)!.className} flex items-center gap-1`}>
                            <AlertTriangle size={12} />
                            {getRiskLevelLabel(record.riskLevel)!.label}
                          </span>
                        )}
                        {record.riskModifiedBy === 'nutritionist' && (
                          <span className="tag tag-info flex items-center gap-1">
                            <span>👨‍⚕️</span>
                            已审核
                          </span>
                        )}
                        {record.alternativeRecipe && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddRecipeToShopping(record.alternativeRecipe!, record.id);
                            }}
                            className="p-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors"
                            title="加入购物清单"
                          >
                            <ShoppingBag size={16} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(record);
                          }}
                          className="p-2 hover:bg-warmgray-100 rounded-lg transition-colors"
                          title="营养师处理"
                        >
                          <Edit3 size={16} className="text-warmgray-500" />
                        </button>
                      </div>
                    </div>
                    {record.isHighRisk && record.riskReason && (
                      <div className="mt-3 p-3 bg-red-50 rounded-xl">
                        <p className="text-sm text-red-600 flex items-start gap-2">
                          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                          <span>{record.riskReason}</span>
                        </p>
                      </div>
                    )}
                    {record.nutritionistNote && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                        <p className="text-sm text-blue-600 flex items-start gap-2">
                          <MessageSquare size={14} className="flex-shrink-0 mt-0.5" />
                          <span>
                            <strong>营养师批注：</strong>{record.nutritionistNote}
                          </span>
                        </p>
                      </div>
                    )}
                    {record.alternativeRecipe && (
                      <div className="mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedRecipeId(expandedRecipeId === record.id ? null : record.id);
                          }}
                          className="w-full p-3 bg-primary-50 rounded-xl flex items-center justify-between hover:bg-primary-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <ChefHat size={16} className="text-primary-600" />
                            <p className="font-medium text-primary-700">替代食谱：{record.alternativeRecipe.name}</p>
                          </div>
                          {expandedRecipeId === record.id ? (
                            <ChevronUp size={18} className="text-primary-600" />
                          ) : (
                            <ChevronDown size={18} className="text-primary-600" />
                          )}
                        </button>
                        
                        {expandedRecipeId === record.id && (
                          <div className="p-4 bg-primary-50/50 rounded-b-xl border-x border-b border-primary-200 animate-fade-in">
                            <div className="flex items-center justify-between mb-3">
                              <p className="font-medium text-warmgray-800">{record.alternativeRecipe.name}</p>
                              <span className="text-sm text-primary-600 font-medium">
                                {record.alternativeRecipe.calories} kcal
                              </span>
                            </div>
                            <div className="mb-3">
                              <p className="text-sm text-warmgray-600 mb-1">所需食材：</p>
                              <div className="flex flex-wrap gap-1.5">
                                {record.alternativeRecipe.ingredients.map((ing, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-white rounded-full text-xs text-warmgray-600">
                                    {ing.name} {ing.amount}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {record.alternativeRecipe.instructions && (
                              <div>
                                <p className="text-sm text-warmgray-600 mb-1">制作步骤：</p>
                                <p className="text-sm text-warmgray-700">{record.alternativeRecipe.instructions}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {editingRecordId === record.id && editForm && (
                      <div className="mt-4 p-4 bg-white rounded-xl border-2 border-primary-200 animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-warmgray-800 flex items-center gap-2">
                            <Gauge size={18} className="text-primary-500" />
                            营养师处理
                          </h4>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                saveEditing(record.id);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                            >
                              <Save size={14} />
                              保存
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelEditing();
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-warmgray-100 text-warmgray-600 rounded-lg text-sm font-medium hover:bg-warmgray-200 transition-colors"
                            >
                              <X size={14} />
                              取消
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-warmgray-700 mb-2">
                              风险等级
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {(['low', 'medium', 'high'] as const).map((level) => (
                                <button
                                  key={level}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditForm({ ...editForm, riskLevel: level });
                                  }}
                                  className={`p-2 rounded-lg text-sm font-medium transition-all ${
                                    editForm.riskLevel === level
                                      ? getRiskLevelColor(level) + ' ring-2 ring-offset-2 ring-opacity-50'
                                      : 'bg-warmgray-50 text-warmgray-600 hover:bg-warmgray-100'
                                  }`}
                                >
                                  {level === 'low' ? '低风险' : level === 'medium' ? '中风险' : '高风险'}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-warmgray-700 mb-2">
                              风险原因
                            </label>
                            <textarea
                              onClick={(e) => e.stopPropagation()}
                              value={editForm.riskReason}
                              onChange={(e) => setEditForm({ ...editForm, riskReason: e.target.value })}
                              placeholder="请输入风险原因..."
                              className="input-field w-full h-20 resize-none"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-warmgray-700 mb-2">
                              营养师批注
                            </label>
                            <textarea
                              onClick={(e) => e.stopPropagation()}
                              value={editForm.nutritionistNote}
                              onChange={(e) => setEditForm({ ...editForm, nutritionistNote: e.target.value })}
                              placeholder="请输入营养师批注..."
                              className="input-field w-full h-20 resize-none"
                            />
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-medium text-warmgray-700">
                                替代食谱
                              </label>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addRecipeIngredient();
                                }}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                              >
                                + 添加食材
                              </button>
                            </div>
                            <div className="space-y-2">
                              <input
                                onClick={(e) => e.stopPropagation()}
                                value={editForm.recipe.name}
                                onChange={(e) => setEditForm({ ...editForm, recipe: { ...editForm.recipe, name: e.target.value } })}
                                placeholder="食谱名称"
                                className="input-field w-full"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  onClick={(e) => e.stopPropagation()}
                                  type="number"
                                  value={editForm.recipe.calories || ''}
                                  onChange={(e) => setEditForm({ ...editForm, recipe: { ...editForm.recipe, calories: parseInt(e.target.value) || 0 } })}
                                  placeholder="热量 (kcal)"
                                  className="input-field"
                                />
                              </div>
                              <div className="space-y-2">
                                {editForm.recipe.ingredients.map((ing, idx) => (
                                  <div key={idx} className="flex gap-2">
                                    <input
                                      onClick={(e) => e.stopPropagation()}
                                      value={ing.name}
                                      onChange={(e) => updateRecipeIngredient(idx, 'name', e.target.value)}
                                      placeholder="食材名称"
                                      className="input-field flex-1"
                                    />
                                    <input
                                      onClick={(e) => e.stopPropagation()}
                                      value={ing.amount}
                                      onChange={(e) => updateRecipeIngredient(idx, 'amount', e.target.value)}
                                      placeholder="用量"
                                      className="input-field w-28"
                                    />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeRecipeIngredient(idx);
                                      }}
                                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <textarea
                                onClick={(e) => e.stopPropagation()}
                                value={editForm.recipe.instructions}
                                onChange={(e) => setEditForm({ ...editForm, recipe: { ...editForm.recipe, instructions: e.target.value } })}
                                placeholder="制作步骤..."
                                className="input-field w-full h-20 resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleShowCompletedItems}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    showCompletedItems
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-warmgray-100 text-warmgray-600 hover:bg-warmgray-200'
                  }`}
                >
                  {showCompletedItems ? '收起已买' : '显示已买'}
                </button>
                {shoppingList.filter(s => s.checked).length > 0 && (
                  <button
                    onClick={clearCompletedItems}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={14} />
                    清空已买
                  </button>
                )}
                <button
                  onClick={() => setShowShoppingList(false)}
                  className="p-2 hover:bg-cream-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4">
              {Object.entries(shoppingByRecipe).map(([recipeId, group]) => {
                const items = showCompletedItems 
                  ? group.items 
                  : group.items.filter(item => !item.checked);
                
                if (items.length === 0) return null;
                
                return (
                  <div key={recipeId}>
                    {group.recipe ? (
                      <div className="flex items-center gap-2 mb-2 px-2">
                        <ChefHat size={16} className="text-primary-500" />
                        <h4 className="font-medium text-primary-600">
                          替代食谱：{group.recipe.name}
                        </h4>
                        <span className="text-xs text-warmgray-400">
                          ({items.filter(i => !i.checked).length}/{group.items.length} 待购)
                        </span>
                      </div>
                    ) : (
                      <h4 className="font-medium text-warmgray-600 mb-2 px-2">其他食材</h4>
                    )}
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
                            <span className="text-xs text-warmgray-400 ml-2">({item.category})</span>
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
              
              {shoppingList.filter(s => showCompletedItems || !s.checked).length === 0 && (
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
