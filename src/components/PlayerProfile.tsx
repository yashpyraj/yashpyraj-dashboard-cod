import React, { useState, useMemo } from 'react';
import { 
  X, 
  User, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Sword,
  Shield,
  Coins,
  Zap,
  Heart,
  Trophy,
  Target,
  Crown,
  Activity,
  FileText
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeeklyData, PlayerData } from '../types';
import { formatNumber, formatNumberWithCommas } from '../utils/csvUtils';
import { ProgressReport } from './ProgressReport';

interface PlayerProfileProps {
  playerIdentifier: string;
  weeklyData: WeeklyData[];
  onClose: () => void;
}

interface PlayerProgress {
  date: string;
  data: PlayerData;
  changes: {
    powerChange: number;
    unitsKilledChange: number;
    unitsDeadChange: number;
    unitsHealedChange: number;
    goldSpentChange: number;
    manaSpentChange: number;
    t5KillsChange: number;
    t4KillsChange: number;
    t3KillsChange: number;
    t2KillsChange: number;
    t1KillsChange: number;
  };
}

export const PlayerProfile: React.FC<PlayerProfileProps> = ({
  playerIdentifier,
  weeklyData,
  onClose
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('power');
  const [showProgressReport, setShowProgressReport] = useState(false);

  // Debug logging
  console.log('PlayerProfile - playerIdentifier:', playerIdentifier);
  console.log('PlayerProfile - weeklyData length:', weeklyData.length);
  console.log('PlayerProfile - weeklyData:', weeklyData);
  // Find player data by either name or lord_id
  const findPlayerInWeek = (week: WeeklyData) => {
    // Only search by lord_id
    return week.players.find(p => String(p.lord_id) === String(playerIdentifier));
  };

  // Get the player name for display
  const playerName = useMemo(() => {
    for (const week of weeklyData) {
      const player = findPlayerInWeek(week);
      if (player) return player.name;
    }
    return playerIdentifier;
  }, [weeklyData, playerIdentifier]);
  const playerProgress = useMemo(() => {
    const progress: PlayerProgress[] = [];
    
    weeklyData.forEach((week, index) => {
      const playerData = findPlayerInWeek(week);
      if (playerData) {
        // Find previous week's data for the same lord_id
        let prevPlayerData = null;
        for (let i = index - 1; i >= 0; i--) {
          const prevWeek = weeklyData[i];
          prevPlayerData = prevWeek.players.find(p => String(p.lord_id) === String(playerData.lord_id));
          if (prevPlayerData) break;
        }
        
        const changes = {
          powerChange: prevPlayerData ? playerData.power - prevPlayerData.power : 0,
          unitsKilledChange: prevPlayerData ? playerData.units_killed - prevPlayerData.units_killed : 0,
          unitsDeadChange: prevPlayerData ? playerData.units_dead - prevPlayerData.units_dead : 0,
          unitsHealedChange: prevPlayerData ? playerData.units_healed - prevPlayerData.units_healed : 0,
          goldSpentChange: prevPlayerData ? playerData.gold_spent - prevPlayerData.gold_spent : 0,
          manaSpentChange: prevPlayerData ? playerData.mana_spent - prevPlayerData.mana_spent : 0,
          t5KillsChange: prevPlayerData ? playerData.killcount_t5 - prevPlayerData.killcount_t5 : 0,
          t4KillsChange: prevPlayerData ? playerData.killcount_t4 - prevPlayerData.killcount_t4 : 0,
          t3KillsChange: prevPlayerData ? playerData.killcount_t3 - prevPlayerData.killcount_t3 : 0,
          t2KillsChange: prevPlayerData ? playerData.killcount_t2 - prevPlayerData.killcount_t2 : 0,
          t1KillsChange: prevPlayerData ? playerData.killcount_t1 - prevPlayerData.killcount_t1 : 0,
        };
        
        progress.push({
          date: week.date,
          data: playerData,
          changes
        });
      }
    });
    
    return progress.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [weeklyData, playerIdentifier]);

  console.log('PlayerProfile - playerProgress length:', playerProgress.length);
  console.log('PlayerProfile - playerProgress:', playerProgress);

  const currentData = playerProgress[playerProgress.length - 1]?.data;
  
  console.log('PlayerProfile - currentData:', currentData);

  if (!currentData) {
    console.log('PlayerProfile - No currentData found, showing error');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Player Not Found</h2>
          <p className="text-gray-400 mb-6">Could not find player with ID: {playerIdentifier}</p>
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

  // If showing progress report, render that instead
  if (showProgressReport) {
    return (
      <ProgressReport
        playerIdentifier={playerIdentifier}
        weeklyData={weeklyData}
        onClose={() => setShowProgressReport(false)}
      />
    );
  }

  const renderMetricChart = (metric: string) => {
    const chartData = playerProgress.map(p => {
      let value;
      switch (metric) {
        case 'power': value = p.data.power; break;
        case 'units_killed': value = p.data.units_killed; break;
        case 'units_dead': value = p.data.units_dead; break;
        case 'units_healed': value = p.data.units_healed; break;
        case 'mana_spent': value = p.data.mana_spent; break;
        case 'mana': value = p.data.mana; break;
        default: value = 0;
      }
      return {
        date: p.date,
        value: value,
        formattedDate: p.date.split('-').slice(1).join('/')
      };
    });
    
    if (chartData.length === 0) return <div className="text-gray-400 text-center py-8">No data available</div>;
    
    const getMetricColor = (metric: string) => {
      switch (metric) {
        case 'power': return '#fbbf24'; // yellow
        case 'units_killed': return '#ef4444'; // red
        case 'units_dead': return '#f97316'; // orange
        case 'units_healed': return '#22c55e'; // green
        case 'mana_spent': return '#8b5cf6'; // purple
        case 'mana': return '#3b82f6'; // blue
        default: return '#6b7280'; // gray
      }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
            <p className="text-white font-medium">{label}</p>
            <p className="text-blue-400">
              {`${metric.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${formatNumber(payload[0].value)}`}
            </p>
          </div>
        );
      }
      return null;
    };
    
    return (
      <div className="bg-gray-800/30 rounded-lg p-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
              dataKey="value" 
              stroke={getMetricColor(metric)}
              strokeWidth={3}
              dot={{ fill: getMetricColor(metric), strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: getMetricColor(metric), strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderChangeIndicator = (change: number, isPositiveGood: boolean = true) => {
    if (change === 0) return <span className="text-gray-400">-</span>;
    
    const isPositive = change > 0;
    const colorClass = isPositiveGood 
      ? (isPositive ? 'text-green-400' : 'text-red-400')
      : (isPositive ? 'text-red-400' : 'text-green-400');
    
    return (
      <div className={`flex items-center gap-1 ${colorClass} font-medium`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {isPositive ? '+' : ''}{formatNumber(change)}
      </div>
    );
  };

  const metrics = [
    { key: 'power', label: 'Power', icon: Crown },
    { key: 'units_killed', label: 'Units Killed', icon: Sword },
    { key: 'units_dead', label: 'Units Dead', icon: Target },
    { key: 'units_healed', label: 'Units Healed', icon: Heart },
    { key: 'mana', label: 'Mana', icon: Zap },
    { key: 'mana_spent', label: 'Mana Spent', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="w-full">
        {/* Header */}
        <div className="sticky top-0 z-50 backdrop-blur-lg bg-gray-900/80 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <User className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{playerName}</h1>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      currentData.alliance_tag === 'BR' 
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                        : currentData.alliance_tag === 'Echo'
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : currentData.alliance_tag === 'IR'
                        ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {currentData.alliance_tag}
                    </span>
                    <span className="text-gray-400 text-sm">Lord ID: {currentData.lord_id}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowProgressReport(true)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg
                           hover:bg-green-700 transition-all duration-300 flex items-center gap-2"
                >
                  <FileText size={16} />
                  Progress Report
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-800/50 text-gray-300 border border-gray-600 rounded-lg
                           hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-300 flex items-center gap-2"
                >
                  <X size={16} />
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col xl:flex-row gap-8">
            {/* Stats Overview */}
            <div className="xl:w-1/3 space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                  <Activity className="text-purple-400" size={24} />
                  Current Stats
                </h3>
                
                <div className="space-y-6">
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Crown className="text-yellow-400" size={24} />
                      <span className="text-gray-300 text-lg">Power</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{formatNumber(currentData.power)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sword className="text-red-400" size={18} />
                        <span className="text-gray-300 text-sm">Killed</span>
                      </div>
                      <div className="text-xl font-bold text-white">{formatNumber(currentData.units_killed)}</div>
                    </div>

                    <div className="glass-card p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="text-orange-400" size={18} />
                        <span className="text-gray-300 text-sm">Dead</span>
                      </div>
                      <div className="text-xl font-bold text-white">{formatNumber(currentData.units_dead)}</div>
                    </div>

                    <div className="glass-card p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="text-green-400" size={18} />
                        <span className="text-gray-300 text-sm">Healed</span>
                      </div>
                      <div className="text-xl font-bold text-white">{formatNumber(currentData.units_healed)}</div>
                    </div>

                    <div className="glass-card p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="text-blue-400" size={18} />
                        <span className="text-gray-300 text-sm">Mana</span>
                      </div>
                      <div className="text-xl font-bold text-white">{formatNumber(currentData.mana_spent)}</div>
                    </div>
                  </div>

                  {/* Kill Counts */}
                  <div className="glass-card p-6">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Trophy className="text-purple-400" size={20} />
                      Kill Counts
                    </h4>
                    <div className="space-y-3">
                      {[
                        { tier: 'T5', count: currentData.killcount_t5, color: 'text-red-400' },
                        { tier: 'T4', count: currentData.killcount_t4, color: 'text-orange-400' },
                        { tier: 'T3', count: currentData.killcount_t3, color: 'text-yellow-400' },
                        { tier: 'T2', count: currentData.killcount_t2, color: 'text-lime-400' },
                        { tier: 'T1', count: currentData.killcount_t1, color: 'text-green-400' },
                      ].map(({ tier, count, color }) => (
                        <div key={tier} className="flex justify-between items-center py-2">
                          <span className="text-gray-300">{tier}:</span>
                          <span className={`font-bold text-lg ${color}`}>{formatNumberWithCommas(count)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Details */}
            <div className="xl:w-2/3 space-y-6">
              {/* Metric Selector and Chart */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                  <Calendar className="text-blue-400" size={24} />
                  Progress Timeline
                </h3>
                
                <div className="flex flex-wrap gap-3 mb-6">
                  {metrics.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setSelectedMetric(key)}
                      className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 ${
                        selectedMetric === key
                          ? 'bg-purple-500/30 text-purple-300 border border-purple-400'
                          : 'bg-gray-800/30 text-gray-300 border border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <Icon size={18} />
                      {label}
                    </button>
                  ))}
                  </div>

                <div className="bg-gray-800/30 rounded-xl p-6">
                  {renderMetricChart(selectedMetric)}
                </div>
              </div>

              {/* Detailed Timeline */}
              <div className="glass-card p-6">
                <h4 className="text-lg font-semibold text-white mb-6">Detailed Progress</h4>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  {playerProgress.map((progress, index) => (
                    <div key={progress.date} className="glass-card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-white font-semibold text-lg">{progress.date}</h5>
                        {index > 0 && (
                          <span className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
                            Week {index + 1}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                          <span className="text-gray-400 text-sm">Power:</span>
                          <div className="text-white font-semibold text-lg">{formatNumber(progress.data.power)}</div>
                          {index > 0 && renderChangeIndicator(progress.changes.powerChange)}
                        </div>
                        
                        <div>
                          <span className="text-gray-400 text-sm">Units Killed:</span>
                          <div className="text-white font-semibold text-lg">{formatNumber(progress.data.units_killed)}</div>
                          {index > 0 && renderChangeIndicator(progress.changes.unitsKilledChange)}
                        </div>
                        
                        <div>
                          <span className="text-gray-400 text-sm">Units Dead:</span>
                          <div className="text-white font-semibold text-lg">{formatNumber(progress.data.units_dead)}</div>
                          {index > 0 && renderChangeIndicator(progress.changes.unitsDeadChange, false)}
                        </div>
                        
                        <div>
                          <span className="text-gray-400 text-sm">Units Healed:</span>
                          <div className="text-white font-semibold text-lg">{formatNumber(progress.data.units_healed)}</div>
                          {index > 0 && renderChangeIndicator(progress.changes.unitsHealedChange)}
                        </div>
                        
                        <div>
                          <span className="text-gray-400 text-sm">Mana Spent:</span>
                          <div className="text-white font-semibold text-lg">{formatNumber(progress.data.mana_spent)}</div>
                          {index > 0 && renderChangeIndicator(progress.changes.manaSpentChange)}
                        </div>
                        
                        <div>
                          <span className="text-gray-400 text-sm">T5 Kills:</span>
                          <div className="text-red-400 font-semibold text-lg">{progress.data.killcount_t5}</div>
                          {index > 0 && renderChangeIndicator(progress.changes.t5KillsChange)}
                        </div>
                        
                        <div>
                          <span className="text-gray-400 text-sm">T4 Kills:</span>
                          <div className="text-orange-400 font-semibold text-lg">{progress.data.killcount_t4}</div>
                          {index > 0 && renderChangeIndicator(progress.changes.t4KillsChange)}
                        </div>
                        
                        <div>
                          <span className="text-gray-400 text-sm">T3 Kills:</span>
                          <div className="text-yellow-400 font-semibold text-lg">{progress.data.killcount_t3}</div>
                          {index > 0 && renderChangeIndicator(progress.changes.t3KillsChange)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};