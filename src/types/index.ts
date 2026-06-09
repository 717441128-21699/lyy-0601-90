export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'member' | 'nutritionist';
  groupId: string;
  groupName: string;
  weightHidden: boolean;
  targetWeight: number;
  startWeight: number;
  currentWeight: number;
  currentWaist?: number;
  joinDate: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: { name: string; amount: string }[];
  calories: number;
  instructions: string;
  imageUrl?: string;
}

export interface DietRecord {
  id: string;
  userId: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  photoUrl: string;
  description: string;
  calorieRange: [number, number];
  isHighRisk: boolean;
  riskReason?: string;
  alternativeRecipe?: Recipe;
  createdAt: string;
}

export interface ExerciseType {
  id: string;
  name: string;
  icon: string;
  caloriesPerMin: number;
  category: 'cardio' | 'strength' | 'flexibility' | 'hiit';
}

export interface ExerciseRecord {
  id: string;
  userId: string;
  date: string;
  exerciseType: string;
  exerciseTypeId: string;
  duration: number;
  calories: number;
  notes: string;
  createdAt: string;
}

export interface WeightRecord {
  id: string;
  userId: string;
  date: string;
  weight: number;
  waist?: number;
  hip?: number;
  note?: string;
  createdAt: string;
}

export interface NutritionistNote {
  id: string;
  userId: string;
  nutritionistId: string;
  nutritionistName: string;
  nutritionistAvatar: string;
  relatedRecordId?: string;
  relatedRecordType?: 'diet' | 'exercise' | 'weight';
  content: string;
  isHighRisk: boolean;
  createdAt: string;
  reply?: string;
  replyAt?: string;
}

export interface ShoppingItem {
  id: string;
  userId: string;
  recipeId?: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
  addedAt: string;
}

export interface GroupRanking {
  userId: string;
  userName: string;
  avatar: string;
  rank: number;
  previousRank: number;
  weightLossPercent: number;
  checkInRate: number;
  exerciseMinutes: number;
  lastWeekChange: number;
}

export interface WeeklyReport {
  id: string;
  userId: string;
  weekStart: string;
  weekEnd: string;
  summary: {
    avgCalories: number;
    totalExerciseMinutes: number;
    weightChange: number;
    checkInDays: number;
    avgDailyCalories: number;
  };
  nutritionistFeedback: string;
  recommendations: string[];
  highlights: string[];
  generatedAt: string;
}

export interface ReviewRequest {
  id: string;
  userId: string;
  preferredDate: string;
  preferredTime: string;
  type: 'video' | 'voice';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  notes: string;
  createdAt: string;
  rejectionReason?: string;
  meetingUrl?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'note' | 'high_risk' | 'report' | 'system' | 'reminder';
  title: string;
  content: string;
  relatedRecordId?: string;
  read: boolean;
  createdAt: string;
}

export interface TodoItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'diet' | 'exercise' | 'weight' | 'note';
  completed: boolean;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

export interface CheckInDay {
  date: string;
  diet: boolean;
  exercise: boolean;
  weight: boolean;
}

export type PageType = 
  | 'dashboard'
  | 'diet'
  | 'exercise'
  | 'body'
  | 'nutritionist'
  | 'leaderboard'
  | 'reports';
