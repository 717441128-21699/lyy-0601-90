import type { ExerciseType } from '@/types';

export const estimateCalorieRange = (description: string): [number, number] => {
  const lowerDesc = description.toLowerCase();
  
  let baseCalories = 400;
  
  if (lowerDesc.includes('汉堡') || lowerDesc.includes('炸鸡') || lowerDesc.includes('披萨')) {
    baseCalories = 800;
  } else if (lowerDesc.includes('沙拉') || lowerDesc.includes('蔬菜')) {
    baseCalories = 250;
  } else if (lowerDesc.includes('米饭') || lowerDesc.includes('面条')) {
    baseCalories = 500;
  } else if (lowerDesc.includes('燕麦') || lowerDesc.includes('粥')) {
    baseCalories = 300;
  } else if (lowerDesc.includes('水果')) {
    baseCalories = 150;
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
