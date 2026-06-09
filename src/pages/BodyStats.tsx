import { useState, useMemo } from 'react';
import {
  Plus,
  TrendingDown,
  Scale,
  Ruler,
  Target,
  Eye,
  EyeOff,
  X,
  Calendar,
  ChevronUp,
  ChevronDown,
  Info,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useUserStore } from '@/store/useUserStore';
import { useBodyStore } from '@/store/useBodyStore';
import { getToday, formatDate, generateDaysArray, formatDateTime } from '@/utils/date';
import { getWeightLossRate } from '@/utils/calories';

const BodyStatsPage = () => {
  const { user, setWeightHidden, updateTargetWeight, updateCurrentWeight, updateCurrentWaist } = useUserStore();
  const { records, addRecord, getWeightTrend, getLatestRecord } = useBodyStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [note, setNote] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [activeTab, setActiveTab] = useState<'weight' | 'waist'>('weight');

  const latestRecord = getLatestRecord();
  const weightLossPercent = getWeightLossRate(user.startWeight, user.currentWeight);
  const totalLoss = user.startWeight - user.currentWeight;
  const remainingLoss = user.currentWeight - user.targetWeight;

  const monthlyTrend = useMemo(() => {
    const trend = getWeightTrend();
    return trend.map(d => ({
      ...d,
      date: formatDate(d.date, 'MM/dd'),
    }));
  }, [getWeightTrend]);

  const waistTrend = useMemo(() => {
    const days = generateDaysArray(30);
    return days.map(date => {
      const record = records.find(r => r.date === date);
      const prevRecords = records.filter(r => r.date <= date && r.waist);
      const waist = record?.waist ?? (prevRecords.length > 0 ? prevRecords[0].waist : 0);
      return {
        date: formatDate(date, 'MM/dd'),
        waist: waist || null,
      };
    }).filter(d => d.waist !== null);
  }, [records]);

  const handleAddRecord = () => {
    const weightNum = parseFloat(weight);
    const waistNum = waist ? parseFloat(waist) : undefined;
    const hipNum = hip ? parseFloat(hip) : undefined;

    if (!weightNum || weightNum < 20 || weightNum > 300) return;

    addRecord({
      date: getToday(),
      weight: weightNum,
      waist: waistNum,
      hip: hipNum,
      note: note || undefined,
    });

    updateCurrentWeight(weightNum);
    if (waistNum) updateCurrentWaist(waistNum);

    setWeight('');
    setWaist('');
    setHip('');
    setNote('');
    setShowAddModal(false);
  };

  const handleUpdateTarget = () => {
    const target = parseFloat(targetWeight);
    if (target && target > 30 && target < user.currentWeight) {
      updateTargetWeight(target);
      setTargetWeight('');
      setShowTargetModal(false);
    }
  };

  const getWeightChange = () => {
    if (records.length < 2) return { value: 0, isDown: true };
    const latest = records[0].weight;
    const previous = records[1].weight;
    const change = Math.round((latest - previous) * 10) / 10;
    return { value: Math.abs(change), isDown: change < 0 };
  };

  const weightChange = getWeightChange();

  const displayWeight = (value: number) => {
    if (user.weightHidden) {
      return <span className="blur-weight">•••</span>;
    }
    return <span className="font-mono">{value.toFixed(1)}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warmgray-800">体围体重</h1>
          <p className="text-warmgray-500 mt-1">记录每一点变化，见证蜕变过程</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWeightHidden(!user.weightHidden)}
            className="p-2.5 bg-white rounded-xl border border-cream-200 hover:bg-cream-50 transition-colors"
            title={user.weightHidden ? '显示体重' : '隐藏体重'}
          >
            {user.weightHidden ? (
              <EyeOff size={20} className="text-warmgray-500" />
            ) : (
              <Eye size={20} className="text-warmgray-500" />
            )}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            记录数据
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-gradient bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-75">当前体重</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold">{displayWeight(user.currentWeight)}</span>
                <span className="text-sm opacity-75">kg</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm">
                {weightChange.value > 0 && (
                  <>
                    {weightChange.isDown ? (
                      <ChevronDown size={16} className="text-green-200" />
                    ) : (
                      <ChevronUp size={16} className="text-red-200" />
                    )}
                    <span>{weightChange.value} kg 较上次</span>
                  </>
                )}
              </div>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Scale size={28} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-warmgray-500">累计减重</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-primary-500 font-mono">-{totalLoss.toFixed(1)}</span>
                <span className="text-warmgray-500">kg</span>
              </div>
              <p className="text-sm text-warmgray-400 mt-2">
                减重率 {weightLossPercent}%
              </p>
            </div>
            <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
              <TrendingDown size={28} className="text-primary-500" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-warmgray-500">当前腰围</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-accent-500 font-mono">{user.currentWaist || '--'}</span>
                <span className="text-warmgray-500">cm</span>
              </div>
              {latestRecord?.hip && (
                <p className="text-sm text-warmgray-400 mt-2">
                  臀围 {latestRecord.hip} cm
                </p>
              )}
            </div>
            <div className="w-14 h-14 bg-accent-100 rounded-2xl flex items-center justify-center">
              <Ruler size={28} className="text-accent-500" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-warmgray-500">目标体重</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-purple-500 font-mono">{displayWeight(user.targetWeight)}</span>
                <span className="text-warmgray-500">kg</span>
              </div>
              <p className="text-sm text-warmgray-400 mt-2">
                还差 {remainingLoss > 0 ? remainingLoss.toFixed(1) : '已达成'} kg
              </p>
            </div>
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Target size={28} className="text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-warmgray-800">数据趋势</h3>
              <div className="flex items-center gap-1 bg-cream-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('weight')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'weight'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-warmgray-500 hover:text-warmgray-700'
                  }`}
                >
                  体重
                </button>
                <button
                  onClick={() => setActiveTab('waist')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'waist'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-warmgray-500 hover:text-warmgray-700'
                  }`}
                >
                  腰围
                </button>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                {activeTab === 'weight' ? (
                  <LineChart data={monthlyTrend}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                    <XAxis dataKey="date" stroke="#78716C" fontSize={12} />
                    <YAxis stroke="#78716C" fontSize={12} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)} kg`, '体重']}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ fill: '#10B981', r: 4 }}
                      activeDot={{ fill: '#10B981', r: 6 }}
                      name="体重 (kg)"
                    />
                  </LineChart>
                ) : (
                  <LineChart data={waistTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                    <XAxis dataKey="date" stroke="#78716C" fontSize={12} />
                    <YAxis stroke="#78716C" fontSize={12} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value: number) => [`${value} cm`, '腰围']}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="waist"
                      stroke="#F97316"
                      strokeWidth={3}
                      dot={{ fill: '#F97316', r: 4 }}
                      activeDot={{ fill: '#F97316', r: 6 }}
                      name="腰围 (cm)"
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-warmgray-800">历史记录</h3>
              <span className="text-sm text-warmgray-500">共 {records.length} 条记录</span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
              {records.slice(0, 15).map((record, index) => (
                <div
                  key={record.id}
                  className="p-4 bg-cream-50 rounded-xl flex items-center justify-between hover:bg-cream-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-cream-200">
                      <Scale size={20} className="text-primary-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-warmgray-800 font-mono">
                          {displayWeight(record.weight)} kg
                        </span>
                        {index === 0 && (
                          <span className="tag tag-success">最新</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-warmgray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {record.date}
                        </span>
                        {record.waist && (
                          <span className="flex items-center gap-1">
                            <Ruler size={14} />
                            腰围 {record.waist}cm
                          </span>
                        )}
                      </div>
                      {record.note && (
                        <p className="text-sm text-warmgray-400 mt-1">{record.note}</p>
                      )}
                    </div>
                  </div>
                  {index > 0 && index < records.length && (
                    <div className="text-right">
                      {(() => {
                        const prevWeight = records[index - 1].weight;
                        const diff = Math.round((record.weight - prevWeight) * 10) / 10;
                        if (diff === 0) return null;
                        return (
                          <span className={`text-sm font-medium ${diff < 0 ? 'text-primary-500' : 'text-accent-500'}`}>
                            {diff > 0 ? '+' : ''}{diff} kg
                          </span>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-warmgray-800">阶段目标</h3>
              <button
                onClick={() => {
                  setTargetWeight(user.targetWeight.toString());
                  setShowTargetModal(true);
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                修改目标
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-warmgray-500">起始体重</span>
                  <span className="font-medium text-warmgray-700 font-mono">{displayWeight(user.startWeight)} kg</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-warmgray-500">当前体重</span>
                  <span className="font-medium text-primary-600 font-mono">{displayWeight(user.currentWeight)} kg</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-warmgray-500">目标体重</span>
                  <span className="font-medium text-purple-600 font-mono">{displayWeight(user.targetWeight)} kg</span>
                </div>
              </div>
              <div className="pt-4 border-t border-cream-200">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-warmgray-500">完成进度</span>
                  <span className="font-semibold text-warmgray-700">
                    {Math.min(100, Math.round((totalLoss / (user.startWeight - user.targetWeight)) * 100))}%
                  </span>
                </div>
                <div className="h-3 bg-cream-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((totalLoss / (user.startWeight - user.targetWeight)) * 100))}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-warmgray-400 mt-2">
                  距离目标还有 {Math.max(0, remainingLoss).toFixed(1)} kg
                </p>
              </div>
            </div>
          </div>

          <div className="card-gradient bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Info size={20} />
              <h3 className="font-semibold">小提示</h3>
            </div>
            <div className="space-y-2 text-sm opacity-90">
              <p>• 建议每天早起空腹称重，条件一致更准确</p>
              <p>• 每周测量一次腰围和臀围，关注体脂变化</p>
              <p>• 健康减重速度：每周 0.5-1 kg</p>
              <p>• 体重波动是正常的，关注长期趋势即可</p>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-warmgray-800 mb-4">本周数据</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-primary-50 rounded-xl text-center">
                <p className="text-xs text-primary-600 mb-1">周减重</p>
                <p className="text-xl font-bold text-primary-600 font-mono">-1.2 kg</p>
              </div>
              <div className="p-3 bg-accent-50 rounded-xl text-center">
                <p className="text-xs text-accent-600 mb-1">体脂率</p>
                <p className="text-xl font-bold text-accent-600 font-mono">28.5%</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl text-center">
                <p className="text-xs text-purple-600 mb-1">BMI</p>
                <p className="text-xl font-bold text-purple-600 font-mono">23.8</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl text-center">
                <p className="text-xs text-green-600 mb-1">基础代谢</p>
                <p className="text-xl font-bold text-green-600 font-mono">1,420</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-bounce-soft">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-warmgray-800">记录身体数据</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-cream-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">
                  体重 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="300"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="请输入体重（kg）"
                    className="input-field pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-warmgray-400">kg</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-warmgray-700 mb-2">腰围（cm）</label>
                  <input
                    type="number"
                    step="0.1"
                    min="40"
                    max="150"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    placeholder="可选"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warmgray-700 mb-2">臀围（cm）</label>
                  <input
                    type="number"
                    step="0.1"
                    min="50"
                    max="150"
                    value={hip}
                    onChange={(e) => setHip(e.target.value)}
                    placeholder="可选"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">备注</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="记录一下特殊情况，如经期、感冒等..."
                  className="input-field h-20 resize-none"
                />
              </div>

              <div className="p-4 bg-primary-50 rounded-xl">
                <p className="text-sm text-primary-700">
                  <span className="font-medium">记录时间：</span>
                  {formatDateTime(new Date())}
                </p>
              </div>

              <button
                onClick={handleAddRecord}
                disabled={!weight || parseFloat(weight) < 20 || parseFloat(weight) > 300}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Scale size={18} />
                保存记录
              </button>
            </div>
          </div>
        </div>
      )}

      {showTargetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-bounce-soft">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-warmgray-800">设置阶段目标</h3>
              <button
                onClick={() => setShowTargetModal(false)}
                className="p-2 hover:bg-cream-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-sm text-purple-700">
                  设置一个合理的阶段性目标，有助于保持动力。建议每阶段目标减重 2-5 kg。
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">
                  目标体重 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max={user.currentWeight - 0.1}
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    placeholder="请输入目标体重（kg）"
                    className="input-field pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-warmgray-400">kg</span>
                </div>
                <p className="text-xs text-warmgray-400 mt-2">
                  当前体重 {user.currentWeight} kg，目标必须小于当前体重
                </p>
              </div>

              {targetWeight && parseFloat(targetWeight) > 0 && (
                <div className="p-4 bg-cream-50 rounded-xl">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-warmgray-500">需要减重</span>
                    <span className="font-semibold text-primary-600">
                      {(user.currentWeight - parseFloat(targetWeight)).toFixed(1)} kg
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-warmgray-500">预计需要</span>
                    <span className="font-semibold text-accent-600">
                      {Math.ceil((user.currentWeight - parseFloat(targetWeight)) / 0.75)} 周
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleUpdateTarget}
                disabled={!targetWeight || parseFloat(targetWeight) >= user.currentWeight}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Target size={18} />
                确认目标
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BodyStatsPage;
