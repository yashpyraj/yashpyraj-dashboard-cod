import React, { useState, useMemo } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Crown, 
  Sword, 
  Target, 
  Heart, 
  Coins, 
  Zap,
  Trophy,
  Users,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  Star
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { WeeklyData, PlayerData } from '../types';
import { formatNumber } from '../utils/csvUtils';

interface PlayerComparisonProps {
  player1Id: string;
  player2Id: string;
  weeklyData: WeeklyData[];
  onClose: () => void;
}

interface PlayerStats {
  name: string;
  lordId: string;
  allianceTag: string;
  currentData: PlayerData;
  weeklyProgress: {
    date: string;
    power: number;
    unitsKilled: number;
    unitsDead: number;
    unitsHealed: number;
    goldSpent: number;
    manaSpent: number;
    t5Kills: number;
    t4Kills: number;
    t3Kills: number;
    t2Kills: number;
    t1Kills: number;
  }[];
  changes: {
    powerChange: number;
    unitsKilledChange: number;
    unitsDeadChange: number;
    unitsHealedChange: number;
    goldSpentChange: number;
    manaSpentChange: number;
  };
}

export const PlayerComparison: React.FC<PlayerComparisonProps> = ({
  player1Id,
  player2Id,
  weeklyData,
  onClose
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('power');

  const findPlayerInWeek = (week: WeeklyData, playerId: string) => {
    return week.players.find(p => String(p.lord_id) === String(playerId));
  };

  const getPlayerStats = (playerId: string): PlayerStats | null => {
    const playerWeeks = weeklyData
      .map(week => ({
        date: week.date,
        player: findPlayerInWeek(week, playerId)
      }))
      .filter(w => w.player)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (playerWeeks.length === 0) return null;

    const currentWeek = playerWeeks[playerWeeks.length - 1];
    const previousWeek = playerWeeks.length > 1 ? playerWeeks[playerWeeks.length - 2] : null;

    const weeklyProgress = playerWeeks.map(w => ({
      date: w.date,
      power: w.player!.power,
      unitsKilled: w.player!.units_killed,
      unitsDead: w.player!.units_dead,
      unitsHealed: w.player!.units_healed,
      goldSpent: w.player!.gold_spent,
      manaSpent: w.player!.mana_spent,
      t5Kills: w.player!.killcount_t5,
      t4Kills: w.player!.killcount_t4,
      t3Kills: w.player!.killcount_t3,
      t2Kills: w.player!.killcount_t2,
      t1Kills: w.player!.killcount_t1,
    }));

    const changes = previousWeek ? {
      powerChange: currentWeek.player!.power - previousWeek.player!.power,
      unitsKilledChange: currentWeek.player!.units_killed - previousWeek.player!.units_killed,
      unitsDeadChange: currentWeek.player!.units_dead - previousWeek.player!.units_dead,
      unitsHealedChange: currentWeek.player!.units_healed - previousWeek.player!.units_healed,
      goldSpentChange: currentWeek.player!.gold_spent - previousWeek.player!.gold_spent,
      manaSpentChange: currentWeek.player!.mana_spent - previousWeek.player!.mana_spent,
    } : {
      powerChange: 0,
      unitsKilledChange: 0,
      unitsDeadChange: 0,
      unitsHealedChange: 0,
      goldSpentChange: 0,
      manaSpentChange: 0,
    };

    return {
      name: currentWeek.player!.name,
      lordId: currentWeek.player!.lord_id,
      allianceTag: currentWeek.player!.alliance_tag,
      currentData: currentWeek.player!,
      weeklyProgress,
      changes
    };
  };

  const player1Stats = getPlayerStats(player1Id);
  const player2Stats = getPlayerStats(player2Id);

  const comparisonData = useMemo(() => {
    if (!player1Stats || !player2Stats) return [];

    const maxLength = Math.max(player1Stats.weeklyProgress.length, player2Stats.weeklyProgress.length);
    const data = [];

    for (let i = 0; i < maxLength; i++) {
      const p1Data = player1Stats.weeklyProgress[i];
      const p2Data = player2Stats.weeklyProgress[i];
      
      if (p1Data && p2Data) {
        data.push({
          date: p1Data.date,
          formattedDate: p1Data.date.split('-').slice(1).join('/'),
          player1: p1Data[selectedMetric as keyof typeof p1Data] || 0,
          player2: p2Data[selectedMetric as keyof typeof p2Data] || 0,
        });
      }
    }

    return data;
  }, [player1Stats, player2Stats, selectedMetric]);

  const radarData = useMemo(() => {
    if (!player1Stats || !player2Stats) return [];

    const metrics = [
      { name: 'Power', key: 'power', max: Math.max(player1Stats.currentData.power, player2Stats.currentData.power) },
      { name: 'Kills', key: 'units_killed', max: Math.max(player1Stats.currentData.units_killed, player2Stats.currentData.units_killed) },
      { name: 'Healed', key: 'units_healed', max: Math.max(player1Stats.currentData.units_healed, player2Stats.currentData.units_healed) },
      { name: 'Gold Spent', key: 'gold_spent', max: Math.max(player1Stats.currentData.gold_spent, player2Stats.currentData.gold_spent) },
      { name: 'Mana Spent', key: 'mana_spent', max: Math.max(player1Stats.currentData.mana_spent, player2Stats.currentData.mana_spent) },
      { name: 'T5 Kills', key: 'killcount_t5', max: Math.max(player1Stats.currentData.killcount_t5, player2Stats.currentData.killcount_t5) },
    ];

    return metrics.map(metric => ({
      metric: metric.name,
      player1: metric.max > 0 ? (player1Stats.currentData[metric.key as keyof PlayerData] as number / metric.max) * 100 : 0,
      player2: metric.max > 0 ? (player2Stats.currentData[metric.key as keyof PlayerData] as number / metric.max) * 100 : 0,
    }));
  }, [player1Stats, player2Stats]);

  if (!player1Stats || !player2Stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Players Not Found</h2>
          <p className="text-gray-400 mb-6">Could not find data for one or both players</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800/50 text-gray-300 border border-gray-600 rounded-lg
                     hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const renderChangeIndicator = (change: number, isPositiveGood: boolean = true) => {
    if (change === 0) return <Minus className="text-gray-400" size={16} />;
    
    const isPositive = change > 0;
    const colorClass = isPositiveGood 
      ? (isPositive ? 'text-green-400' : 'text-red-400')
      : (isPositive ? 'text-red-400' : 'text-green-400');
    
    return isPositive ? <ArrowUp className={colorClass} size={16} /> : <ArrowDown className={colorClass} size={16} />;
  };

  const renderProgressBar = (value1: number, value2: number, max: number) => {
    const percentage1 = (value1 / max) * 100;
    const percentage2 = (value2 / max) * 100;
    
    return (
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${percentage1}%` }}
            />
          </div>
        </div>
        <div className="w-16 text-center text-sm text-gray-400">VS</div>
        <div className="flex-1">
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
              style={{ width: `${percentage2}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey === 'player1' ? player1Stats.name : player2Stats.name}: ${formatNumber(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const metrics = [
    { key: 'power', label: 'Power', icon: Crown },
    { key: 'unitsKilled', label: 'Units Killed', icon: Sword },
    { key: 'unitsDead', label: 'Units Dead', icon: Target },
    { key: 'unitsHealed', label: 'Units Healed', icon: Heart },
    { key: 'goldSpent', label: 'Gold Spent', icon: Coins },
    { key: 'manaSpent', label: 'Mana Spent', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-gray-900/80 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-orange-500 rounded-xl">
                <Users className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Player Comparison</h1>
                <p className="text-gray-400">Head-to-head performance analysis</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-800/50 text-gray-300 border border-gray-600 rounded-lg
                       hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-300 flex items-center gap-2"
            >
              <X size={16} />
              Close Comparison
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Player Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Player 1 Card */}
          <div className="glass-card p-8 border-2 border-blue-500/30 bg-blue-500/5">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Crown className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{player1Stats.name}</h2>
              <div className="flex items-center justify-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  player1Stats.allianceTag === 'BR' 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                    : player1Stats.allianceTag === 'Echo'
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : player1Stats.allianceTag === 'IR'
                    ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {player1Stats.allianceTag}
                </span>
                <span className="text-gray-400 text-sm">ID: {player1Stats.lordId}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Crown className="text-yellow-400" size={20} />
                  <span className="text-gray-300">Power</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-lg">{formatNumber(player1Stats.currentData.power)}</div>
                  <div className="flex items-center gap-1 text-sm">
                    {renderChangeIndicator(player1Stats.changes.powerChange)}
                    <span className={player1Stats.changes.powerChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {formatNumber(Math.abs(player1Stats.changes.powerChange))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sword className="text-red-400" size={16} />
                    <span className="text-gray-300 text-sm">Kills</span>
                  </div>
                  <div className="text-white font-bold">{formatNumber(player1Stats.currentData.units_killed)}</div>
                </div>
                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="text-orange-400" size={16} />
                    <span className="text-gray-300 text-sm">Dead</span>
                  </div>
                  <div className="text-white font-bold">{formatNumber(player1Stats.currentData.units_dead)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Player 2 Card */}
          <div className="glass-card p-8 border-2 border-orange-500/30 bg-orange-500/5">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Crown className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{player2Stats.name}</h2>
              <div className="flex items-center justify-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  player2Stats.allianceTag === 'BR' 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                    : player2Stats.allianceTag === 'Echo'
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : player2Stats.allianceTag === 'IR'
                    ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {player2Stats.allianceTag}
                </span>
                <span className="text-gray-400 text-sm">ID: {player2Stats.lordId}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Crown className="text-yellow-400" size={20} />
                  <span className="text-gray-300">Power</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-lg">{formatNumber(player2Stats.currentData.power)}</div>
                  <div className="flex items-center gap-1 text-sm">
                    {renderChangeIndicator(player2Stats.changes.powerChange)}
                    <span className={player2Stats.changes.powerChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {formatNumber(Math.abs(player2Stats.changes.powerChange))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sword className="text-red-400" size={16} />
                    <span className="text-gray-300 text-sm">Kills</span>
                  </div>
                  <div className="text-white font-bold">{formatNumber(player2Stats.currentData.units_killed)}</div>
                </div>
                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="text-orange-400" size={16} />
                    <span className="text-gray-300 text-sm">Dead</span>
                  </div>
                  <div className="text-white font-bold">{formatNumber(player2Stats.currentData.units_dead)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Comparison Bars */}
        <div className="glass-card p-8">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
            <BarChart3 className="text-purple-400" size={24} />
            Performance Comparison
          </h3>
          
          <div className="space-y-6">
            {[
              { label: 'Power', value1: player1Stats.currentData.power, value2: player2Stats.currentData.power, icon: Crown, color: 'text-yellow-400' },
              { label: 'Units Killed', value1: player1Stats.currentData.units_killed, value2: player2Stats.currentData.units_killed, icon: Sword, color: 'text-red-400' },
              { label: 'Units Dead', value1: player1Stats.currentData.units_dead, value2: player2Stats.currentData.units_dead, icon: Target, color: 'text-orange-400' },
              { label: 'Units Healed', value1: player1Stats.currentData.units_healed, value2: player2Stats.currentData.units_healed, icon: Heart, color: 'text-green-400' },
              { label: 'Gold Spent', value1: player1Stats.currentData.gold_spent, value2: player2Stats.currentData.gold_spent, icon: Coins, color: 'text-yellow-300' },
              { label: 'Mana Spent', value1: player1Stats.currentData.mana_spent, value2: player2Stats.currentData.mana_spent, icon: Zap, color: 'text-purple-400' },
            ].map((stat, index) => {
              const max = Math.max(stat.value1, stat.value2);
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <stat.icon className={stat.color} size={20} />
                      <span className="text-white font-medium">{stat.label}</span>
                    </div>
                    <div className="flex items-center gap-8 text-sm">
                      <span className="text-blue-300 font-medium">{formatNumber(stat.value1)}</span>
                      <span className="text-orange-300 font-medium">{formatNumber(stat.value2)}</span>
                    </div>
                  </div>
                  {renderProgressBar(stat.value1, stat.value2, max)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Trend Chart */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp className="text-green-400" size={20} />
                Progress Trends
              </h4>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white text-sm"
              >
                {metrics.map(metric => (
                  <option key={metric.key} value={metric.key}>{metric.label}</option>
                ))}
              </select>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="formattedDate" 
                    stroke="#9ca3af"
                    fontSize={12}
                    tick={{ fill: '#9ca3af' }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    fontSize={12}
                    tick={{ fill: '#9ca3af' }}
                    tickFormatter={(value) => formatNumber(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="player1" 
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    name={player1Stats.name}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="player2" 
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                    name={player2Stats.name}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="glass-card p-6">
            <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Star className="text-purple-400" size={20} />
              Overall Performance
            </h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickFormatter={() => ''}
                  />
                  <Radar
                    name={player1Stats.name}
                    dataKey="player1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Radar
                    name={player2Stats.name}
                    dataKey="player2"
                    stroke="#f97316"
                    fill="#f97316"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Kill Distribution */}
        <div className="glass-card p-8">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
            <Trophy className="text-purple-400" size={24} />
            Kill Distribution Comparison
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-medium text-blue-300 mb-4">{player1Stats.name}</h4>
              <div className="space-y-3">
                {[
                  { tier: 'T5', count: player1Stats.currentData.killcount_t5, color: 'bg-red-500' },
                  { tier: 'T4', count: player1Stats.currentData.killcount_t4, color: 'bg-orange-500' },
                  { tier: 'T3', count: player1Stats.currentData.killcount_t3, color: 'bg-yellow-500' },
                  { tier: 'T2', count: player1Stats.currentData.killcount_t2, color: 'bg-lime-500' },
                  { tier: 'T1', count: player1Stats.currentData.killcount_t1, color: 'bg-green-500' },
                ].map(({ tier, count, color }) => (
                  <div key={tier} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 ${color} rounded`}></div>
                      <span className="text-gray-300 font-medium">{tier}</span>
                    </div>
                    <span className="text-white font-bold text-lg">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-orange-300 mb-4">{player2Stats.name}</h4>
              <div className="space-y-3">
                {[
                  { tier: 'T5', count: player2Stats.currentData.killcount_t5, color: 'bg-red-500' },
                  { tier: 'T4', count: player2Stats.currentData.killcount_t4, color: 'bg-orange-500' },
                  { tier: 'T3', count: player2Stats.currentData.killcount_t3, color: 'bg-yellow-500' },
                  { tier: 'T2', count: player2Stats.currentData.killcount_t2, color: 'bg-lime-500' },
                  { tier: 'T1', count: player2Stats.currentData.killcount_t1, color: 'bg-green-500' },
                ].map(({ tier, count, color }) => (
                  <div key={tier} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 ${color} rounded`}></div>
                      <span className="text-gray-300 font-medium">{tier}</span>
                    </div>
                    <span className="text-white font-bold text-lg">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};