import React, { useState, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BarChart3, 
  X, 
  Plus,
  Filter,
  Zap,
  Database
} from 'lucide-react';
import { WeeklyData, PlayerComparison } from '../types';
import { formatNumber, formatDelta, calculatePlayerDeltas, formatNumberWithCommas, formatLargeNumber } from '../utils/csvUtils';
import { PlayerComparison as PlayerComparisonComponent } from './PlayerComparison';

interface PlayerTableProps {
  weeklyData: WeeklyData[];
  selectedAlliance: string | null;
  onPlayerProfileSelect: (playerName: string) => void;
  onPlayerComparison?: (player1Id: string, player2Id: string) => void;
}

type SortKey = keyof PlayerComparison;
type SortDirection = 'asc' | 'desc';

interface PlayerGrowth {
  player_name: string;
  alliance: string;
  weeks: {
    date: string;
    power: number;
    kills: number;
    deaths: number;
    gold_spent: number;
    resources_collected: number;
    t5_kills: number;
    t4_kills: number;
    t3_kills: number;
    t2_kills: number;
    t1_kills: number;
  }[];
}

export const PlayerTable: React.FC<PlayerTableProps> = ({
  weeklyData,
  selectedAlliance,
  onPlayerProfileSelect,
  onPlayerComparison
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('power');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [showGrowthDetails, setShowGrowthDetails] = useState<string | null>(null);
  const [showPlayerComparison, setShowPlayerComparison] = useState(false);

  const processedData = useMemo(() => {
    // Get all players from all weeks
    let allPlayers: PlayerComparison[] = [];
    
    if (weeklyData.length === 0) return [];
    
    // Sort weeks by date to ensure proper chronological order
    const sortedWeeks = [...weeklyData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Get the most recent week's data
    const currentWeek = sortedWeeks[sortedWeeks.length - 1];
    const previousWeek = sortedWeeks.length > 1 ? sortedWeeks[sortedWeeks.length - 2] : null;
    
    console.log('PlayerTable - Using current week:', currentWeek.date);
    console.log('PlayerTable - Previous week:', previousWeek?.date || 'None');
    
    // Process all players from the current week
    allPlayers = currentWeek.players.map(current => {
      if (previousWeek) {
        const previous = previousWeek.players.find(p => p.lord_id === current.lord_id);
        if (previous) {
          const deltas = calculatePlayerDeltas(current, previous);
          return { ...current, ...deltas };
        }
      }
      return current;
    });

    // Filter by search term
    const searchFiltered = allPlayers.filter(player =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.lord_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.alliance_tag.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort data
    const sorted = [...searchFiltered].sort((a, b) => {
      const aValue = a[sortKey] as number;
      const bValue = b[sortKey] as number;
      
      if (sortDirection === 'asc') {
        return aValue - bValue;
      }
      return bValue - aValue;
    });

    return sorted;
  }, [weeklyData, selectedAlliance, sortKey, sortDirection, searchTerm]);

  const playerGrowthData = useMemo(() => {
    const growthMap = new Map<string, any>();
    
    weeklyData.forEach(week => {
      week.players.forEach(player => {
        if (!growthMap.has(player.lord_id)) {
          growthMap.set(player.lord_id, {
            name: player.name,
            lord_id: player.lord_id,
            alliance_tag: player.alliance_tag,
            weeks: []
          });
        }
        
        growthMap.get(player.lord_id)!.weeks.push({
          date: week.date,
          power: player.power,
          units_killed: player.units_killed,
          units_dead: player.units_dead,
          gold_spent: player.gold_spent,
          killcount_t5: player.killcount_t5,
          killcount_t4: player.killcount_t4,
          killcount_t3: player.killcount_t3,
          killcount_t2: player.killcount_t2,
          killcount_t1: player.killcount_t1,
        });
      });
    });

    // Sort weeks by date for each player
    growthMap.forEach(growth => {
      growth.weeks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    return Array.from(growthMap.values());
  }, [weeklyData]);

  const comparisonData = useMemo(() => {
    return selectedPlayers.map(lordId => {
      const playerGrowth = playerGrowthData.find(p => p.lord_id === lordId);
      const currentData = processedData.find(p => p.lord_id === lordId);
      return { playerGrowth, currentData };
    }).filter(p => p.playerGrowth && p.currentData);
  }, [selectedPlayers, playerGrowthData, processedData]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const handlePlayerSelect = (lordId: string) => {
    setSelectedPlayers(prev => 
      prev.includes(lordId) 
        ? prev.filter(p => p !== lordId)
        : [...prev, lordId]
    );
  };

  const handleCompareSelected = () => {
    if (selectedPlayers.length === 2) {
      if (onPlayerComparison) {
        onPlayerComparison(selectedPlayers[0], selectedPlayers[1]);
      } else {
        setShowPlayerComparison(true);
      }
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null;
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const renderDelta = (delta: number | undefined, isPositiveGood: boolean = true) => {
    if (delta === undefined) return null;
    const isPositive = delta >= 0;
    const colorClass = isPositiveGood 
      ? (isPositive ? 'text-green-400' : 'text-red-400')
      : (isPositive ? 'text-red-400' : 'text-green-400');
    
    return (
      <div className={`text-xs ${colorClass} font-medium flex items-center gap-1`}>
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {formatDelta(delta)}
      </div>
    );
  };

  // Show player comparison if requested
  if (showPlayerComparison && selectedPlayers.length === 2) {
    return (
      <PlayerComparisonComponent
        player1Id={selectedPlayers[0]}
        player2Id={selectedPlayers[1]}
        weeklyData={weeklyData}
        onClose={() => setShowPlayerComparison(false)}
      />
    );
  }

  const renderGrowthChart = (weeks: any[], attribute: string) => {
    if (weeks.length < 2) return null;
    
    const values = weeks.map(w => w[attribute]);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;
    
    return (
      <div className="flex items-end gap-1 h-8">
        {values.map((value, index) => {
          const height = range > 0 ? ((value - min) / range) * 100 : 50;
          const isIncrease = index > 0 && value > values[index - 1];
          const isDecrease = index > 0 && value < values[index - 1];
          
          return (
            <div
              key={index}
              className={`w-2 rounded-t transition-all duration-300 ${
                isIncrease ? 'bg-green-400' : 
                isDecrease ? 'bg-red-400' : 'bg-blue-400'
              }`}
              style={{ height: `${Math.max(height, 10)}%` }}
              title={`${weeks[index].date}: ${formatNumber(value)}`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="glass-card p-6 border border-green-500/20">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Database className="text-emerald-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Advanced Player Analytics</h3>
                <p className="text-sm text-gray-400">Individual performance metrics and comparisons</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search players by name or lord ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white w-80
                         focus:outline-none focus:border-blue-400 transition-colors duration-300"
              />
            </div>
            {selectedPlayers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {selectedPlayers.length} selected
                </span>
                {selectedPlayers.length === 2 && (
                  <button
                    onClick={handleCompareSelected}
                    className="px-4 py-2 bg-cyan-500/20 text-cyan-300 border border-cyan-400 rounded-lg
                             hover:bg-cyan-500/30 transition-all duration-300 flex items-center gap-2"
                  >
                    <Zap size={16} />
                    Compare Players
                  </button>
                )}
                <button
                  onClick={() => setSelectedPlayers([])}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-300"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Detailed Growth Panel */}
      {showGrowthDetails && (
        <div className="glass-card p-6 border border-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="text-green-400" size={20} />
              Growth Details: {showGrowthDetails}
            </h4>
            <button
              onClick={() => setShowGrowthDetails(null)}
              className="text-gray-400 hover:text-red-400 transition-colors duration-300"
            >
              <X size={20} />
            </button>
          </div>
          
          {(() => {
            const playerGrowth = playerGrowthData.find(p => p.name === showGrowthDetails);
            if (!playerGrowth) return null;
            
            return (
           <div className="overflow-x-auto max-w-full">
  <table className="min-w-[1000px] w-full">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Power</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Units Killed</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Units Dead</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Gold</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">T5</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">T4</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">T3</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">T2</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">T1</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerGrowth.weeks.map((week, index) => {
                      const prevWeek = index > 0 ? playerGrowth.weeks[index - 1] : null;
                      return (
                        <tr key={week.date} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                          <td className="py-3 px-4 text-white font-medium">{week.date}</td>
                          <td className="py-3 px-4">
                            <div className="text-white">{formatNumber(week.power)}</div>
                            {prevWeek && (
                              <div className="text-xs text-green-400">
                                +{formatNumber(week.power - prevWeek.power)}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white">{week.units_killed}</div>
                            {prevWeek && (
                              <div className="text-xs text-green-400">
                                +{week.units_killed - prevWeek.units_killed}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white">{week.units_dead}</div>
                            {prevWeek && (
                              <div className={`text-xs ${week.units_dead > prevWeek.units_dead ? 'text-red-400' : 'text-green-400'}`}>
                                {week.units_dead > prevWeek.units_dead ? '+' : ''}{week.units_dead - prevWeek.units_dead}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white">{formatNumber(week.gold_spent)}</div>
                            {prevWeek && (
                              <div className="text-xs text-yellow-400">
                                +{formatNumber(week.gold_spent - prevWeek.gold_spent)}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-red-400">{week.killcount_t5}</td>
                          <td className="py-3 px-4 text-orange-400">{week.killcount_t4}</td>
                          <td className="py-3 px-4 text-yellow-400">{week.killcount_t3}</td>
                          <td className="py-3 px-4 text-lime-400">{week.killcount_t2}</td>
                          <td className="py-3 px-4 text-green-400">{week.killcount_t1}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* Main Player Table */}
      <div className="glass-card p-6 border border-gray-600/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-500/20 rounded-lg">
            <BarChart3 className="text-gray-400" size={20} />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">Player Performance Matrix</h4>
            <p className="text-sm text-gray-400">Comprehensive player statistics and rankings</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-600">
                <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                  <input
                    type="checkbox"
                    className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlayers(processedData.map(p => p.lord_id));
                      } else {
                        setSelectedPlayers([]);
                      }
                    }}
                    checked={selectedPlayers.length === processedData.length && processedData.length > 0}
                  />
                </th>
                {[
                  { key: 'name', label: 'Player', sortable: true },
                  { key: 'alliance_tag', label: 'Alliance', sortable: true },
                  { key: 'power', label: 'Power', sortable: true },
                  { key: 'units_killed', label: 'Units Killed', sortable: true },
                  { key: 'units_dead', label: 'Units Dead', sortable: true },
                  { key: 'units_healed', label: 'Units Healed', sortable: true },
                  { key: 'mana', label: 'Mana', sortable: true },
                  { key: 'mana_spent', label: 'Mana Spent', sortable: true },
                  { key: 'killcount_t5', label: 'Kill Count T5', sortable: true },
                  { key: 'killcount_t4', label: 'Kill Count T4', sortable: true },
                  { key: 'killcount_t3', label: 'Kill Count T3', sortable: true },
                  { key: 'killcount_t2', label: 'Kill Count T2', sortable: true },
                  { key: 'killcount_t1', label: 'Kill Count T1', sortable: true },
                ].map(column => (
                  <th
                    key={column.key}
                    className={`text-left py-4 px-4 text-gray-300 font-semibold ${
                      column.sortable ? 'cursor-pointer hover:text-white transition-colors duration-200' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(column.key as SortKey)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && <SortIcon column={column.key as SortKey} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedData.map((player, index) => (
                <tr 
                  key={player.lord_id}
                  className={`border-b border-gray-700/30 hover:bg-gray-800/20 transition-all duration-200 ${
                    selectedPlayers.includes(player.lord_id) ? 'bg-blue-500/10 border-blue-500/30' : ''
                  }`}
                >
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
                      checked={selectedPlayers.includes(player.lord_id)}
                      onChange={() => handlePlayerSelect(player.lord_id)}
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-white">{player.name}</div>
                    <button
                     onClick={() => {
                       console.log('Selecting player:', player.lord_id, player.name);
                       onPlayerProfileSelect(player.lord_id);
                     }}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors duration-200"
                    >
                      View Profile
                    </button>
                    <div className="text-xs text-gray-400">ID: {player.lord_id}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      player.alliance_tag === 'BTX' 
                        ? 'bg-blue-500/20 text-blue-300' 
                        : player.alliance_tag === 'Echo'
                        ? 'bg-green-500/20 text-green-300'
                        : player.alliance_tag === 'IR'
                        ? 'bg-gray-500/20 text-gray-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {player.alliance_tag}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-white font-medium">{formatNumber(player.power)}</div>
                    {renderDelta(player.powerDelta)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-white font-medium">{formatNumberWithCommas(player.units_killed)}</div>
                    {renderDelta(player.unitsKilledDelta)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-white font-medium">{formatNumberWithCommas(player.units_dead)}</div>
                    {renderDelta(player.unitsDeadDelta, false)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-white font-medium">{formatNumberWithCommas(player.units_healed)}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-white font-medium">{formatLargeNumber(player.mana)}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-white font-medium">{formatLargeNumber(player.mana_spent)}</div>
                  </td>
                  <td className="py-4 px-4 text-red-400 font-medium">{formatNumberWithCommas(player.killcount_t5)}</td>
                  <td className="py-4 px-4 text-orange-400 font-medium">{formatNumberWithCommas(player.killcount_t4)}</td>
                  <td className="py-4 px-4 text-yellow-400 font-medium">{formatNumberWithCommas(player.killcount_t3)}</td>
                  <td className="py-4 px-4 text-lime-400 font-medium">{formatNumberWithCommas(player.killcount_t2)}</td>
                  <td className="py-4 px-4 text-green-400 font-medium">{formatNumberWithCommas(player.killcount_t1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {processedData.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-500 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No Players Found</h3>
            <p className="text-gray-500">No players match your current search criteria.</p>
          </div>
        )}
      </div>

    </div>
  );
};