import { create } from 'zustand';
import type { DietRecord, ShoppingItem, Recipe } from '@/types';
import { mockDietRecords, mockShoppingList } from '@/mock/data';
import { storage, generateId } from '@/utils/storage';
import { getToday, getTodayISO } from '@/utils/date';
import { estimateCalorieRange, checkHighRisk } from '@/utils/calories';
import { useNotificationStore } from '@/store/useNotificationStore';

interface DietState {
  records: DietRecord[];
  shoppingList: ShoppingItem[];
  addRecord: (data: Omit<DietRecord, 'id' | 'userId' | 'calorieRange' | 'isHighRisk' | 'riskReason' | 'alternativeRecipe' | 'createdAt'>) => { record: DietRecord; wasHighRisk: boolean };
  toggleShoppingItem: (id: string) => void;
  addShoppingItem: (name: string, quantity: string, category: string, recipeId?: string) => void;
  addRecipeIngredients: (recipe: Recipe, recordId: string) => number;
  removeShoppingItem: (id: string) => void;
  markAsHighRisk: (recordId: string, reason: string, alternativeRecipe?: Recipe) => void;
  markAsLowRisk: (recordId: string) => void;
  getTodayRecords: () => DietRecord[];
  getRecordsByDate: (date: string) => DietRecord[];
  getHighRiskRecords: () => DietRecord[];
}

const getInitialRecords = (): DietRecord[] => {
  const stored = storage.get<DietRecord[] | null>('dietRecords', null);
  return stored || mockDietRecords;
};

const getInitialShoppingList = (): ShoppingItem[] => {
  const stored = storage.get<ShoppingItem[] | null>('shoppingList', null);
  return stored || mockShoppingList;
};

export const useDietStore = create<DietState>((set, get) => ({
  records: getInitialRecords(),
  shoppingList: getInitialShoppingList(),
  
  addRecord: (data) => {
    const riskCheck = checkHighRisk(data.description);
    const newRecord: DietRecord = {
      ...data,
      id: generateId('diet'),
      userId: 'user-001',
      calorieRange: estimateCalorieRange(data.description),
      isHighRisk: riskCheck.isHighRisk,
      riskReason: riskCheck.reason || undefined,
      alternativeRecipe: riskCheck.recipe,
      createdAt: getTodayISO(),
    };
    
    set((state) => {
      const updated = [newRecord, ...state.records];
      storage.set('dietRecords', updated);
      return { records: updated };
    });
    
    if (riskCheck.isHighRisk) {
      const { addNotification } = useNotificationStore.getState();
      addNotification({
        type: 'high_risk',
        title: '⚠️ 饮食风险提醒',
        content: `您记录的「${data.description}」被标记为高风险食物，${riskCheck.reason}，建议查看营养师推荐的替代方案。`,
        relatedRecordId: newRecord.id,
      });
    }
    
    return { record: newRecord, wasHighRisk: riskCheck.isHighRisk };
  },
  
  toggleShoppingItem: (id) => set((state) => {
    const updated = state.shoppingList.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    storage.set('shoppingList', updated);
    return { shoppingList: updated };
  }),
  
  addShoppingItem: (name, quantity, category, recipeId) => set((state) => {
    const existingItem = state.shoppingList.find(
      item => item.name === name && item.quantity === quantity && !item.checked
    );
    
    if (existingItem) {
      return { shoppingList: state.shoppingList };
    }
    
    const newItem: ShoppingItem = {
      id: generateId('shop'),
      userId: 'user-001',
      recipeId,
      name,
      quantity,
      category,
      checked: false,
      addedAt: getToday(),
    };
    const updated = [newItem, ...state.shoppingList];
    storage.set('shoppingList', updated);
    return { shoppingList: updated };
  }),
  
  addRecipeIngredients: (recipe, recordId) => {
    const { addShoppingItem } = get();
    let addedCount = 0;
    
    recipe.ingredients.forEach((ing) => {
      const category = ing.name.includes('肉') || ing.name.includes('鸡') || ing.name.includes('牛') || ing.name.includes('鱼') || ing.name.includes('蛋')
        ? '肉类蛋豆'
        : ing.name.includes('菜') || ing.name.includes('瓜') || ing.name.includes('菇')
        ? '蔬菜水果'
        : ing.name.includes('米') || ing.name.includes('面') || ing.name.includes('麦') || ing.name.includes('饼') || ing.name.includes('胚')
        ? '主食谷物'
        : ing.name.includes('奶') || ing.name.includes('酪') || ing.name.includes('糖') || ing.name.includes('油')
        ? '调味奶制品'
        : '其他';
      
      const existing = get().shoppingList.find(
        item => item.name === ing.name && item.quantity === ing.amount && !item.checked
      );
      
      if (!existing) {
        addShoppingItem(ing.name, ing.amount, category, recipe.id);
        addedCount++;
      }
    });
    
    if (addedCount > 0) {
      const { addNotification } = useNotificationStore.getState();
      addNotification({
        type: 'system',
        title: '🛒 购物清单已更新',
        content: `已将「${recipe.name}」的 ${addedCount} 种食材添加到购物清单，点击查看。`,
        relatedRecordId: recipe.id,
      });
    }
    
    return addedCount;
  },
  
  removeShoppingItem: (id) => set((state) => {
    const updated = state.shoppingList.filter(item => item.id !== id);
    storage.set('shoppingList', updated);
    return { shoppingList: updated };
  }),
  
  markAsHighRisk: (recordId, reason, alternativeRecipe) => set((state) => {
    const updated = state.records.map(record =>
      record.id === recordId
        ? { ...record, isHighRisk: true, riskReason: reason, alternativeRecipe }
        : record
    );
    storage.set('dietRecords', updated);
    
    const record = updated.find(r => r.id === recordId);
    if (record) {
      const { addNotification } = useNotificationStore.getState();
      addNotification({
        type: 'high_risk',
        title: '营养师标记高风险',
        content: `营养师将您的「${record.description}」标记为高风险：${reason}，建议按照推荐的替代方案调整饮食。`,
        relatedRecordId: recordId,
      });
    }
    
    return { records: updated };
  }),
  
  markAsLowRisk: (recordId) => set((state) => {
    const updated = state.records.map(record =>
      record.id === recordId
        ? { ...record, isHighRisk: false, riskReason: undefined, alternativeRecipe: undefined }
        : record
    );
    storage.set('dietRecords', updated);
    return { records: updated };
  }),
  
  getTodayRecords: () => {
    const today = getToday();
    return get().records.filter(r => r.date === today);
  },
  
  getRecordsByDate: (date) => {
    return get().records.filter(r => r.date === date);
  },
  
  getHighRiskRecords: () => {
    return get().records.filter(r => r.isHighRisk);
  },
}));
