import type { ExerciseType, Recipe } from '@/types';
import { generateId } from '@/utils/storage';

export const HIGH_RISK_KEYWORDS = [
  '汉堡', '炸鸡', '披萨', '薯条', '可乐', '奶茶', '蛋糕', '巧克力',
  '冰淇淋', '烧烤', '火锅', '油炸', '麻辣', '炸鸡排', '肯德基', '麦当劳',
  '星巴克', '喜茶', '奈雪', '甜品', '奶油', '芝士', '培根', '香肠',
  '方便面', '辣条', '薯片', '饼干', '糖果', '布丁', '蛋挞', '甜甜圈'
];

export const HIGH_SUGAR_KEYWORDS = [
  '奶茶', '可乐', '蛋糕', '巧克力', '冰淇淋', '糖果', '布丁', '蛋挞',
  '甜甜圈', '喜茶', '奈雪', '星巴克', '甜品', '奶油', '芝士', '饼干',
  '水果糖', '奶昔', '冰沙', '焦糖', '蜂蜜', '红糖', '白糖', '冰糖'
];

export const HIGH_CALORIE_THRESHOLD = 600;

export const alternativeRecipes: Record<string, Recipe> = {
  '汉堡': {
    id: 'recipe-burger',
    name: '低卡全麦牛肉堡',
    calories: 380,
    ingredients: [
      { name: '全麦汉堡胚', amount: '1个' },
      { name: '瘦牛肉馅', amount: '100g' },
      { name: '生菜', amount: '2片' },
      { name: '番茄', amount: '3片' },
      { name: '低脂芝士', amount: '1片' },
      { name: '酸黄瓜', amount: '2条' }
    ],
    instructions: '牛肉馅用黑胡椒和盐腌制后煎熟，全麦胚烤香，依次夹入生菜、番茄、牛肉饼、芝士、酸黄瓜即可。',
    imageUrl: ''
  },
  '炸鸡': {
    id: 'recipe-fried-chicken',
    name: '空气炸锅版无油鸡腿',
    calories: 280,
    ingredients: [
      { name: '去皮鸡腿肉', amount: '150g' },
      { name: '面包糠', amount: '20g' },
      { name: '鸡蛋', amount: '1个' },
      { name: '黑胡椒', amount: '适量' },
      { name: '蒜瓣', amount: '3瓣' }
    ],
    instructions: '鸡腿肉用黑胡椒、蒜末腌制30分钟，裹蛋液和面包糠，空气炸锅180度20分钟，中途翻面。',
    imageUrl: ''
  },
  '披萨': {
    id: 'recipe-pizza',
    name: '全麦蔬菜披萨',
    calories: 320,
    ingredients: [
      { name: '全麦薄饼', amount: '1张' },
      { name: '低脂马苏里拉', amount: '30g' },
      { name: '彩椒', amount: '50g' },
      { name: '口蘑', amount: '3个' },
      { name: '鸡胸肉', amount: '50g' },
      { name: '番茄酱', amount: '2勺' }
    ],
    instructions: '薄饼刷番茄酱，铺鸡胸肉丁和蔬菜，撒低脂芝士，烤箱200度12分钟即可。',
    imageUrl: ''
  },
  '奶茶': {
    id: 'recipe-milk-tea',
    name: '自制低卡奶茶',
    calories: 120,
    ingredients: [
      { name: '纯牛奶', amount: '250ml' },
      { name: '红茶包', amount: '1个' },
      { name: '零卡糖', amount: '1勺' },
      { name: '仙草冻', amount: '50g' }
    ],
    instructions: '红茶用少量热水泡开，加入温牛奶和零卡糖搅拌均匀，加入仙草冻即可。',
    imageUrl: ''
  },
  '蛋糕': {
    id: 'recipe-cake',
    name: '豆腐慕斯蛋糕',
    calories: 180,
    ingredients: [
      { name: '内酯豆腐', amount: '200g' },
      { name: '无糖酸奶', amount: '100g' },
      { name: '吉利丁片', amount: '2片' },
      { name: '零卡糖', amount: '20g' },
      { name: '柠檬汁', amount: '1勺' }
    ],
    instructions: '吉利丁片泡软，豆腐、酸奶、零卡糖、柠檬汁搅拌顺滑，加入融化的吉利丁，冷藏4小时凝固。',
    imageUrl: ''
  },
  'default': {
    id: 'recipe-default',
    name: '健康均衡餐',
    calories: 350,
    ingredients: [
      { name: '糙米', amount: '50g' },
      { name: '鸡胸肉', amount: '100g' },
      { name: '西兰花', amount: '100g' },
      { name: '胡萝卜', amount: '50g' },
      { name: '橄榄油', amount: '1勺' }
    ],
    instructions: '糙米蒸熟，鸡胸肉用黑胡椒腌制后煎熟，蔬菜焯水后淋少许橄榄油和盐拌匀。',
    imageUrl: ''
  }
};

export const checkHighRisk = (description: string): { isHighRisk: boolean; reason: string; recipe?: Recipe } => {
  const lowerDesc = description.toLowerCase();
  const calorieRange = estimateCalorieRange(description);
  const avgCalories = (calorieRange[0] + calorieRange[1]) / 2;
  
  const matchedHighRisk = HIGH_RISK_KEYWORDS.find(kw => lowerDesc.includes(kw));
  const matchedHighSugar = HIGH_SUGAR_KEYWORDS.find(kw => lowerDesc.includes(kw));
  
  let isHighRisk = false;
  let reason = '';
  
  if (matchedHighRisk) {
    isHighRisk = true;
    reason = `检测到「${matchedHighRisk}」属于高热量食物，建议控制食用量或选择健康替代方案`;
  } else if (matchedHighSugar) {
    isHighRisk = true;
    reason = `检测到「${matchedHighSugar}」属于高糖食物，糖分摄入过多不利于体重管理`;
  } else if (avgCalories >= HIGH_CALORIE_THRESHOLD) {
    isHighRisk = true;
    reason = `估算热量约 ${avgCalories} kcal，热量较高，建议搭配运动消耗或减少分量`;
  }
  
  if (isHighRisk) {
    const recipe = alternativeRecipes[matchedHighRisk || matchedHighSugar || ''] || alternativeRecipes['default'];
    return { isHighRisk, reason, recipe: { ...recipe, id: generateId('recipe') } };
  }
  
  return { isHighRisk: false, reason: '' };
};

export const estimateCalorieRange = (description: string): [number, number] => {
  const lowerDesc = description.toLowerCase();
  
  let baseCalories = 400;
  
  if (lowerDesc.includes('汉堡') || lowerDesc.includes('炸鸡') || lowerDesc.includes('披萨') || lowerDesc.includes('烧烤')) {
    baseCalories = 800;
  } else if (lowerDesc.includes('奶茶') || lowerDesc.includes('可乐') || lowerDesc.includes('蛋糕') || lowerDesc.includes('冰淇淋')) {
    baseCalories = 550;
  } else if (lowerDesc.includes('沙拉') || lowerDesc.includes('蔬菜')) {
    baseCalories = 250;
  } else if (lowerDesc.includes('米饭') || lowerDesc.includes('面条')) {
    baseCalories = 500;
  } else if (lowerDesc.includes('燕麦') || lowerDesc.includes('粥')) {
    baseCalories = 300;
  } else if (lowerDesc.includes('水果')) {
    baseCalories = 150;
  } else if (lowerDesc.includes('鸡胸肉') || lowerDesc.includes('牛肉')) {
    baseCalories = 350;
  } else if (lowerDesc.includes('豆腐') || lowerDesc.includes('鸡蛋')) {
    baseCalories = 200;
  }
  
  const variance = Math.round(baseCalories * 0.15);
  return [baseCalories - variance, baseCalories + variance];
};

export const calculateExerciseCalories = (
  exerciseType: ExerciseType | undefined,
  durationMinutes: number
): number => {
  if (!exerciseType) return 0;
  return Math.round(exerciseType.caloriesPerMin * durationMinutes);
};

export const getDailyCalorieTarget = (weight: number, isMale: boolean = false, activityLevel: number = 1.375): number => {
  const bmr = isMale 
    ? 88.362 + (13.397 * weight) + (4.799 * 170) - (5.677 * 30)
    : 447.593 + (9.247 * weight) + (3.098 * 160) - (4.330 * 30);
  
  return Math.round(bmr * activityLevel);
};

export const formatCalories = (calories: number): string => {
  return `${calories} kcal`;
};

export const formatCalorieRange = (range: [number, number]): string => {
  return `${range[0]}-${range[1]} kcal`;
};

export const getWeightLossRate = (startWeight: number, currentWeight: number): number => {
  const loss = startWeight - currentWeight;
  return Math.round((loss / startWeight) * 1000) / 10;
};

export const getBMICategory = (weight: number, height: number): { bmi: number; category: string; color: string } => {
  const bmi = Math.round((weight / ((height / 100) ** 2)) * 10) / 10;
  
  if (bmi < 18.5) {
    return { bmi, category: '偏瘦', color: 'text-blue-600' };
  } else if (bmi < 24) {
    return { bmi, category: '正常', color: 'text-primary-600' };
  } else if (bmi < 28) {
    return { bmi, category: '超重', color: 'text-accent-600' };
  } else {
    return { bmi, category: '肥胖', color: 'text-red-600' };
  }
};
