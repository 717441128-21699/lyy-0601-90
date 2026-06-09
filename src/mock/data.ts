import type {
  User,
  DietRecord,
  ExerciseRecord,
  WeightRecord,
  NutritionistNote,
  GroupRanking,
  WeeklyReport,
  Notification,
  ShoppingItem,
  ExerciseType,
  TodoItem,
  ReviewRequest,
  Recipe,
} from '@/types';
import { getToday, getDaysAgo } from '@/utils/date';
import { generateId } from '@/utils/storage';

export const mockUser: User = {
  id: 'user-001',
  name: '李小美',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaomei',
  role: 'member',
  groupId: 'group-01',
  groupName: '活力减脂一组',
  weightHidden: false,
  targetWeight: 55,
  startWeight: 70,
  currentWeight: 65.5,
  currentWaist: 82,
  joinDate: '2026-03-01',
};

export const mockNutritionist = {
  id: 'nutri-001',
  name: '王营养师',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nutritionist',
};

export const mockExerciseTypes: ExerciseType[] = [
  { id: 'running', name: '跑步', icon: '🏃‍♀️', caloriesPerMin: 10, category: 'cardio' },
  { id: 'swimming', name: '游泳', icon: '🏊‍♀️', caloriesPerMin: 12, category: 'cardio' },
  { id: 'yoga', name: '瑜伽', icon: '🧘‍♀️', caloriesPerMin: 4, category: 'flexibility' },
  { id: 'cycling', name: '骑行', icon: '🚴‍♀️', caloriesPerMin: 8, category: 'cardio' },
  { id: 'walking', name: '快走', icon: '🚶‍♀️', caloriesPerMin: 5, category: 'cardio' },
  { id: 'strength', name: '力量训练', icon: '🏋️‍♀️', caloriesPerMin: 7, category: 'strength' },
  { id: 'dance', name: '跳舞', icon: '💃', caloriesPerMin: 8, category: 'cardio' },
  { id: 'hiit', name: 'HIIT', icon: '🔥', caloriesPerMin: 14, category: 'hiit' },
  { id: 'badminton', name: '羽毛球', icon: '🏸', caloriesPerMin: 9, category: 'cardio' },
  { id: 'rope', name: '跳绳', icon: '⏱️', caloriesPerMin: 11, category: 'cardio' },
  { id: 'pilates', name: '普拉提', icon: '🤸‍♀️', caloriesPerMin: 5, category: 'flexibility' },
  { id: 'boxing', name: '拳击', icon: '🥊', caloriesPerMin: 13, category: 'hiit' },
];

const generateDietRecords = (): DietRecord[] => {
  const records: DietRecord[] = [];
  const mealTypes: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = ['breakfast', 'lunch', 'dinner', 'snack'];
  const breakfastOptions = [
    '燕麦粥 + 水煮蛋 + 小番茄',
    '全麦面包 + 牛油果 + 煎蛋',
    '玉米 + 豆浆 + 凉拌黄瓜',
    '杂粮粥 + 茶叶蛋 + 苹果',
  ];
  const lunchOptions = [
    '糙米饭 + 鸡胸肉 + 西兰花',
    '藜麦沙拉 + 烤三文鱼 + 芦笋',
    '荞麦面 + 牛肉片 + 蔬菜汤',
    '红薯 + 清蒸鱼 + 炒青菜',
    '汉堡套餐 + 薯条 + 可乐',
  ];
  const dinnerOptions = [
    '蔬菜汤 + 豆腐 + 少量米饭',
    '水煮虾 + 菌菇 + 生菜',
    '烤鸡腿 + 烤蔬菜 + 藜麦',
    '火锅 + 肥牛 + 各种丸子',
  ];
  const snackOptions = [
    '希腊酸奶 + 坚果',
    '水果沙拉',
    '蛋白棒',
    '奶茶 + 蛋糕',
  ];

  for (let i = 13; i >= 0; i--) {
    const date = getDaysAgo(i);
    
    mealTypes.forEach((mealType, idx) => {
      if (Math.random() > 0.2 || i <= 2) {
        let description = '';
        let isHighRisk = false;
        let riskReason = '';
        let alternativeRecipe: Recipe | undefined;

        if (mealType === 'breakfast') {
          description = breakfastOptions[Math.floor(Math.random() * breakfastOptions.length)];
        } else if (mealType === 'lunch') {
          description = lunchOptions[Math.floor(Math.random() * lunchOptions.length)];
          if (description.includes('汉堡')) {
            isHighRisk = true;
            riskReason = '高脂高热量，建议减少油炸食品摄入';
            alternativeRecipe = {
              id: generateId('recipe'),
              name: '健康全麦汉堡套餐',
              calories: 450,
              instructions: '1. 全麦面包替换普通面包 2. 用烤鸡胸肉替代油炸肉饼 3. 添加大量生菜番茄 4. 用无糖气泡水替代可乐',
              ingredients: [
                { name: '全麦面包', amount: '2片' },
                { name: '鸡胸肉', amount: '150g' },
                { name: '生菜', amount: '适量' },
                { name: '番茄', amount: '1个' },
                { name: '无糖气泡水', amount: '1罐' },
              ],
            };
          }
        } else if (mealType === 'dinner') {
          description = dinnerOptions[Math.floor(Math.random() * dinnerOptions.length)];
          if (description.includes('火锅')) {
            isHighRisk = true;
            riskReason = '晚餐过于油腻，且热量超标严重';
          }
        } else {
          if (Math.random() > 0.5) {
            description = snackOptions[Math.floor(Math.random() * snackOptions.length)];
            if (description.includes('奶茶')) {
              isHighRisk = true;
              riskReason = '高糖饮料，建议换成无糖茶饮';
            }
          }
        }

        if (description) {
          const calorieMin = 200 + Math.floor(Math.random() * 300);
          records.push({
            id: generateId('diet'),
            userId: 'user-001',
            date,
            mealType,
            photoUrl: '',
            description,
            calorieRange: [calorieMin, calorieMin + 100],
            isHighRisk,
            riskReason: isHighRisk ? riskReason : undefined,
            alternativeRecipe,
            createdAt: `${date}T${String(8 + idx * 4).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
          });
        }
      }
    });
  }

  return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const mockDietRecords: DietRecord[] = generateDietRecords();

const generateExerciseRecords = (): ExerciseRecord[] => {
  const records: ExerciseRecord[] = [];
  
  for (let i = 13; i >= 0; i--) {
    const date = getDaysAgo(i);
    if (Math.random() > 0.3 || i <= 5) {
      const count = Math.random() > 0.7 ? 2 : 1;
      for (let j = 0; j < count; j++) {
        const exerciseType = mockExerciseTypes[Math.floor(Math.random() * mockExerciseTypes.length)];
        const duration = 20 + Math.floor(Math.random() * 40);
        const calories = duration * exerciseType.caloriesPerMin;
        
        records.push({
          id: generateId('exercise'),
          userId: 'user-001',
          date,
          exerciseType: exerciseType.name,
          exerciseTypeId: exerciseType.id,
          duration,
          calories,
          notes: '',
          createdAt: `${date}T${10 + Math.floor(Math.random() * 8)}:00:00`,
        });
      }
    }
  }

  return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const mockExerciseRecords: ExerciseRecord[] = generateExerciseRecords();

const generateWeightRecords = (): WeightRecord[] => {
  const records: WeightRecord[] = [];
  let weight = 67;
  
  for (let i = 27; i >= 0; i--) {
    const date = getDaysAgo(i);
    if (i % 2 === 0 || i === 0) {
      weight = weight - (Math.random() * 0.3 - 0.05);
      records.push({
        id: generateId('weight'),
        userId: 'user-001',
        date,
        weight: Math.round(weight * 10) / 10,
        waist: 85 - Math.floor(i / 4),
        hip: 95 - Math.floor(i / 5),
        note: i === 0 ? '早起空腹称重' : undefined,
        createdAt: `${date}T07:30:00`,
      });
    }
  }

  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const mockWeightRecords: WeightRecord[] = generateWeightRecords();

export const mockNutritionistNotes: NutritionistNote[] = [
  {
    id: generateId('note'),
    userId: 'user-001',
    nutritionistId: 'nutri-001',
    nutritionistName: '王营养师',
    nutritionistAvatar: mockNutritionist.avatar,
    relatedRecordId: mockDietRecords.find(r => r.isHighRisk)?.id,
    relatedRecordType: 'diet',
    content: '昨天午餐的汉堡套餐热量太高了，而且缺少蔬菜。我为你安排了健康版本的替代食谱，记得查看哦！这周整体表现不错，继续保持！',
    isHighRisk: true,
    createdAt: getDaysAgo(0) + 'T14:30:00',
  },
  {
    id: generateId('note'),
    userId: 'user-001',
    nutritionistId: 'nutri-001',
    nutritionistName: '王营养师',
    nutritionistAvatar: mockNutritionist.avatar,
    content: '本周运动打卡率达到了85%，非常棒！建议可以增加一些力量训练，帮助提高基础代谢率。',
    isHighRisk: false,
    createdAt: getDaysAgo(1) + 'T16:00:00',
    reply: '好的，我明天开始增加力量训练！',
    replyAt: getDaysAgo(1) + 'T18:30:00',
  },
  {
    id: generateId('note'),
    userId: 'user-001',
    nutritionistId: 'nutri-001',
    nutritionistName: '王营养师',
    nutritionistAvatar: mockNutritionist.avatar,
    content: '体重下降趋势很好，平均每周减重0.5-0.8kg，这是健康的减重速度。继续保持这个节奏，不要急于求成。',
    isHighRisk: false,
    createdAt: getDaysAgo(3) + 'T10:15:00',
  },
  {
    id: generateId('note'),
    userId: 'user-001',
    nutritionistId: 'nutri-001',
    nutritionistName: '王营养师',
    nutritionistAvatar: mockNutritionist.avatar,
    relatedRecordType: 'weight',
    content: '看到你昨天的晚餐是火锅，虽然很美味但确实不太适合减脂期。下次可以选择清汤锅底，多涮蔬菜和瘦肉，避免吃太多丸子类加工食品。',
    isHighRisk: true,
    createdAt: getDaysAgo(4) + 'T09:00:00',
  },
];

export const mockGroupRanking: GroupRanking[] = [
  {
    userId: 'user-001',
    userName: '李小美',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaomei',
    rank: 2,
    previousRank: 3,
    weightLossPercent: 6.4,
    checkInRate: 92,
    exerciseMinutes: 420,
    lastWeekChange: -1.2,
  },
  {
    userId: 'user-002',
    userName: '张大勇',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dayong',
    rank: 1,
    previousRank: 1,
    weightLossPercent: 7.8,
    checkInRate: 98,
    exerciseMinutes: 560,
    lastWeekChange: -1.5,
  },
  {
    userId: 'user-003',
    userName: '王小花',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaohua',
    rank: 3,
    previousRank: 2,
    weightLossPercent: 5.9,
    checkInRate: 88,
    exerciseMinutes: 380,
    lastWeekChange: -0.8,
  },
  {
    userId: 'user-004',
    userName: '刘小明',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming',
    rank: 4,
    previousRank: 5,
    weightLossPercent: 4.5,
    checkInRate: 75,
    exerciseMinutes: 300,
    lastWeekChange: -0.5,
  },
  {
    userId: 'user-005',
    userName: '陈小燕',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoyan',
    rank: 5,
    previousRank: 4,
    weightLossPercent: 4.2,
    checkInRate: 70,
    exerciseMinutes: 280,
    lastWeekChange: -0.3,
  },
  {
    userId: 'user-006',
    userName: '赵大壮',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dazhuang',
    rank: 6,
    previousRank: 6,
    weightLossPercent: 3.8,
    checkInRate: 65,
    exerciseMinutes: 240,
    lastWeekChange: -0.4,
  },
];

export const mockWeeklyReports: WeeklyReport[] = [
  {
    id: generateId('report'),
    userId: 'user-001',
    weekStart: getDaysAgo(6),
    weekEnd: getToday(),
    summary: {
      avgCalories: 1650,
      totalExerciseMinutes: 420,
      weightChange: -1.2,
      checkInDays: 6,
      avgDailyCalories: 1650,
    },
    nutritionistFeedback: '本周表现非常出色！体重下降1.2kg，运动总时长达到了420分钟。饮食方面整体控制得不错，但有2次高风险饮食记录需要注意。继续保持这个势头！',
    recommendations: [
      '建议增加早餐的蛋白质摄入，可以加一个鸡蛋或牛奶',
      '晚餐尽量在7点前完成，避免夜宵',
      '每周增加1-2次力量训练，帮助塑形',
      '多喝水，每天至少2000ml',
    ],
    highlights: [
      '🎉 本周减重1.2kg，超出预期目标！',
      '🏆 运动打卡率达到85%，小组排名第2',
      '💪 连续运动打卡7天，获得"运动达人"徽章',
    ],
    generatedAt: getToday() + 'T09:00:00',
  },
  {
    id: generateId('report'),
    userId: 'user-001',
    weekStart: getDaysAgo(13),
    weekEnd: getDaysAgo(7),
    summary: {
      avgCalories: 1750,
      totalExerciseMinutes: 360,
      weightChange: -0.8,
      checkInDays: 5,
      avgDailyCalories: 1750,
    },
    nutritionistFeedback: '上周表现良好，减重0.8kg。饮食记录比较完整，但有几天运动时长不足。建议周末也保持运动习惯。',
    recommendations: [
      '周末可以安排户外活动，如爬山、骑行',
      '减少精制碳水摄入，用粗粮替代白米饭',
      '保证充足睡眠，每天7-8小时',
    ],
    highlights: [
      '📉 体重持续下降趋势',
      '✅ 饮食记录完整度高',
    ],
    generatedAt: getDaysAgo(6) + 'T09:00:00',
  },
];

export const mockNotifications: Notification[] = [
  {
    id: generateId('notif'),
    userId: 'user-001',
    type: 'high_risk',
    title: '饮食风险提醒',
    content: '营养师标记了您昨天的午餐为高风险饮食，请查看批注和替代食谱。',
    relatedRecordId: mockDietRecords.find(r => r.isHighRisk)?.id,
    read: false,
    createdAt: getToday() + 'T14:35:00',
  },
  {
    id: generateId('notif'),
    userId: 'user-001',
    type: 'report',
    title: '周报告已生成',
    content: '您的本周健康报告已生成，包含数据总结和营养师建议。',
    read: false,
    createdAt: getToday() + 'T09:05:00',
  },
  {
    id: generateId('notif'),
    userId: 'user-001',
    type: 'reminder',
    title: '提醒补记数据',
    content: '您今天还没有记录早餐，记得及时补记哦！',
    read: false,
    createdAt: getToday() + 'T10:00:00',
  },
  {
    id: generateId('notif'),
    userId: 'user-001',
    type: 'note',
    title: '营养师回复',
    content: '王营养师回复了您的留言，点击查看详情。',
    read: true,
    createdAt: getDaysAgo(1) + 'T17:00:00',
  },
  {
    id: generateId('notif'),
    userId: 'user-001',
    type: 'system',
    title: '小组活动通知',
    content: '本周六上午10点将举办公益减脂讲座，欢迎参加！',
    read: true,
    createdAt: getDaysAgo(2) + 'T15:00:00',
  },
];

export const mockShoppingList: ShoppingItem[] = [
  { id: generateId('shop'), userId: 'user-001', name: '全麦面包', quantity: '1袋', category: '主食', checked: false, addedAt: getToday() },
  { id: generateId('shop'), userId: 'user-001', name: '鸡胸肉', quantity: '500g', category: '肉类', checked: false, addedAt: getToday() },
  { id: generateId('shop'), userId: 'user-001', name: '生菜', quantity: '1颗', category: '蔬菜', checked: true, addedAt: getToday() },
  { id: generateId('shop'), userId: 'user-001', name: '番茄', quantity: '3个', category: '蔬菜', checked: false, addedAt: getToday() },
  { id: generateId('shop'), userId: 'user-001', name: '无糖气泡水', quantity: '1罐', category: '饮品', checked: false, addedAt: getToday() },
  { id: generateId('shop'), userId: 'user-001', name: '鸡蛋', quantity: '1盒', category: '蛋类', checked: true, addedAt: getDaysAgo(1) },
  { id: generateId('shop'), userId: 'user-001', name: '燕麦', quantity: '500g', category: '主食', checked: true, addedAt: getDaysAgo(1) },
  { id: generateId('shop'), userId: 'user-001', name: '希腊酸奶', quantity: '4杯', category: '乳制品', checked: false, addedAt: getDaysAgo(1) },
];

export const mockTodos: TodoItem[] = [
  {
    id: generateId('todo'),
    userId: 'user-001',
    title: '记录早餐',
    description: '拍照上传今日早餐',
    type: 'diet',
    completed: false,
    dueDate: getToday(),
    priority: 'high',
  },
  {
    id: generateId('todo'),
    userId: 'user-001',
    title: '运动30分钟',
    description: '今日运动目标：跑步30分钟',
    type: 'exercise',
    completed: false,
    dueDate: getToday(),
    priority: 'high',
  },
  {
    id: generateId('todo'),
    userId: 'user-001',
    title: '称重记录',
    description: '早起空腹称重并记录',
    type: 'weight',
    completed: true,
    dueDate: getToday(),
    priority: 'medium',
  },
  {
    id: generateId('todo'),
    userId: 'user-001',
    title: '查看营养师批注',
    description: '营养师有新的批注，请查看并回复',
    type: 'note',
    completed: false,
    dueDate: getToday(),
    priority: 'high',
  },
];

export const mockReviewRequests: ReviewRequest[] = [
  {
    id: generateId('review'),
    userId: 'user-001',
    preferredDate: getDaysAgo(-3),
    preferredTime: '19:00',
    type: 'video',
    status: 'pending',
    notes: '希望讨论一下平台期突破方法',
    createdAt: getToday() + 'T11:00:00',
  },
  {
    id: generateId('review'),
    userId: 'user-001',
    preferredDate: getDaysAgo(7),
    preferredTime: '20:00',
    type: 'video',
    status: 'completed',
    notes: '回顾第一个月的减重成果',
    createdAt: getDaysAgo(10) + 'T14:00:00',
    meetingUrl: 'https://meeting.example.com/abc123',
  },
];
