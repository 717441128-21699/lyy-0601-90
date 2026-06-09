import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  ShoppingCart,
  ChefHat,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useDietStore } from '@/store/useDietStore';
import { formatDate, formatDateTime } from '@/utils/date';
import type { DietRecord } from '@/types';

const RiskReviewPanel = () => {
  const { getWeeklyRiskReview, addRecipeIngredients } = useDietStore();
  const navigate = useNavigate();
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  const review = getWeeklyRiskReview();

  const getMealLabel = (type: string) => {
    const labels: Record<string, string> = {
      breakfast: '早餐',
      lunch: '午餐',
      dinner: '晚餐',
      snack: '加餐',
    };
    return labels[type] || type;
  };

  const getRiskLevelLabel = (level?: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high': return { label: '高风险', className: 'tag-danger' };
      case 'medium': return { label: '中风险', className: 'tag-warning' };
      case 'low': return { label: '低风险', className: 'tag-success' };
      default: return null;
    }
  };

  const handleAddToShoppingList = (record: DietRecord) => {
    if (record.alternativeRecipe) {
      const addedCount = addRecipeIngredients(record.alternativeRecipe, record.id);
      if (addedCount > 0) {
        alert(`已将 ${record.alternativeRecipe.name} 的 ${addedCount} 种食材加入购物清单`);
      }
    }
  };

  const handleViewRecord = (record: DietRecord) => {
    navigate('/diet', { state: { highlightId: record.id } });
  };

  const stats = [
    {
      label: '高风险餐食',
      value: review.totalHighRisk,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      label: '营养师已处理',
      value: review.processedByNutritionist,
      icon: CheckCircle,
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
    },
    {
      label: '已加入购物清单',
      value: review.addedToShoppingList,
      icon: ShoppingCart,
      color: 'text-accent-500',
      bgColor: 'bg-accent-50',
    },
    {
      label: '已采购完成',
      value: review.shoppingCompleted,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-warmgray-800 flex items-center gap-2">
          <AlertTriangle size={20} className="text-accent-500" />
          本周风险复盘
        </h3>
        <span className="text-sm text-warmgray-500">
          {review.totalHighRisk > 0 
            ? `${review.processedByNutritionist}/${review.totalHighRisk} 已处理` 
            : '暂无高风险餐食'}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`${stat.bgColor} rounded-xl p-3 text-center`}>
              <Icon size={20} className={`${stat.color} mx-auto mb-1`} />
              <p className="text-xl font-bold text-warmgray-800 font-mono">{stat.value}</p>
              <p className="text-xs text-warmgray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {review.totalHighRisk > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-warmgray-600 mb-2">高风险餐食列表</h4>
          {review.records.map(({ record, isProcessed, hasAlternativeRecipe, isAddedToShoppingList, shoppingCompleted, shoppingProgress }) => {
            const riskLabel = getRiskLevelLabel(record.riskLevel);
            const isExpanded = expandedRecordId === record.id;
            
            return (
              <div
                key={record.id}
                className={`border rounded-xl overflow-hidden transition-all ${
                  shoppingCompleted 
                    ? 'bg-green-50 border-green-200' 
                    : isAddedToShoppingList 
                      ? 'bg-accent-50 border-accent-200' 
                      : isProcessed 
                        ? 'bg-primary-50 border-primary-200' 
                        : 'bg-red-50 border-red-200'
                }`}
              >
                <div
                  className="p-3 cursor-pointer"
                  onClick={() => setExpandedRecordId(isExpanded ? null : record.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl overflow-hidden">
                        <img
                          src={record.photoUrl}
                          alt={record.description}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-warmgray-800">{record.description}</h4>
                          {riskLabel && (
                            <span className={`tag ${riskLabel.className} text-xs`}>
                              {riskLabel.label}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-warmgray-500">
                          <span>{formatDate(record.date)}</span>
                          <span>·</span>
                          <span>{getMealLabel(record.mealType)}</span>
                          <span>·</span>
                          <span>{record.calorieRange[0]}-{record.calorieRange[1]} kcal</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {isProcessed ? (
                          <span className="flex items-center gap-1 text-xs text-primary-600">
                            <CheckCircle size={14} />
                            已处理
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-red-500">
                            <Clock size={14} />
                            待处理
                          </span>
                        )}
                        {hasAlternativeRecipe && (
                          <span className="flex items-center gap-1 text-xs text-primary-600">
                            <ChefHat size={14} />
                            有食谱
                          </span>
                        )}
                        {isAddedToShoppingList && (
                          <span className="flex items-center gap-1 text-xs text-accent-600">
                            <ShoppingCart size={14} />
                            {shoppingCompleted ? '已买完' : `${shoppingProgress}%`}
                          </span>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-warmgray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-warmgray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-current/10 pt-3">
                    {record.riskReason && (
                      <div className="mb-3">
                        <h5 className="text-xs font-medium text-warmgray-600 mb-1">风险原因</h5>
                        <p className="text-sm text-red-600">{record.riskReason}</p>
                      </div>
                    )}

                    {record.nutritionistNote && (
                      <div className="mb-3">
                        <h5 className="text-xs font-medium text-warmgray-600 mb-1">营养师批注</h5>
                        <p className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded-lg">
                          {record.nutritionistNote}
                        </p>
                      </div>
                    )}

                    {record.alternativeRecipe && (
                      <div className="mb-3">
                        <h5 className="text-xs font-medium text-warmgray-600 mb-1">替代食谱</h5>
                        <div className="bg-primary-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-primary-700">
                              {record.alternativeRecipe.name}
                            </span>
                            <span className="text-sm text-primary-600">
                              {record.alternativeRecipe.calories} kcal
                            </span>
                          </div>
                          <div className="text-xs text-primary-600 mb-2">
                            食材：{record.alternativeRecipe.ingredients.map(i => `${i.name}${i.amount}`).join('、')}
                          </div>
                          {!isAddedToShoppingList && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToShoppingList(record);
                              }}
                              className="btn-primary btn-sm w-full flex items-center justify-center gap-1 mt-2"
                            >
                              <ShoppingCart size={14} />
                              加入购物清单
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {isAddedToShoppingList && record.alternativeRecipe && (
                      <div className="mb-3">
                        <h5 className="text-xs font-medium text-warmgray-600 mb-1">采购进度</h5>
                        <div className="bg-accent-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-accent-700">
                              {shoppingCompleted ? '已全部采购完成' : `已完成 ${shoppingProgress}%`}
                            </span>
                            <span className="text-xs text-accent-600">
                              {record.alternativeRecipe.ingredients.length} 种食材
                            </span>
                          </div>
                          <div className="w-full h-2 bg-accent-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent-500 rounded-full transition-all"
                              style={{ width: `${shoppingProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewRecord(record);
                        }}
                        className="btn-secondary btn-sm flex-1 flex items-center justify-center gap-1"
                      >
                        <ArrowRight size={14} />
                        查看记录
                      </button>
                      {record.alternativeRecipe && !isAddedToShoppingList && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToShoppingList(record);
                          }}
                          className="btn-primary btn-sm flex-1 flex items-center justify-center gap-1"
                        >
                          <ShoppingCart size={14} />
                          加入清单
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {review.totalHighRisk === 0 && (
        <div className="text-center py-8">
          <CheckCircle size={48} className="mx-auto text-green-400 mb-2" />
          <p className="text-warmgray-600 font-medium">本周饮食控制良好</p>
          <p className="text-warmgray-400 text-sm mt-1">暂无高风险餐食，继续保持！</p>
        </div>
      )}
    </div>
  );
};

export default RiskReviewPanel;
