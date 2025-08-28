import React from 'react';
import { 
  Download, 
  TrendingUp, 
  Sword, 
  Target, 
  Heart, 
  Coins, 
  TreePine, 
  Pickaxe, 
  Droplets,
  Package,
  Calendar,
  User,
  ChevronDown
} from 'lucide-react';
import { WeeklyData, PlayerData } from '../types';
import { formatNumber } from '../utils/csvUtils';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ProgressReportProps {
  playerIdentifier: string;
  weeklyData: WeeklyData[];
  onClose: () => void;
}

interface PlayerProgress {
  startDate: string;
  endDate: string;
  startData: PlayerData;
  endData: PlayerData;
  changes: {
    powerChange: number;
    unitsKilledChange: number;
    unitsDeadChange: number;
    unitsHealedChange: number;
    goldSpentChange: number;
    woodSpentChange: number;
    stoneSpentChange: number;
    manaSpentChange: number;
    goldGatheredChange: number;
    woodGatheredChange: number;
    oreGatheredChange: number;
    manaGatheredChange: number;
    t5KillsChange: number;
    t4KillsChange: number;
    t3KillsChange: number;
    t2KillsChange: number;
    t1KillsChange: number;
  };
}

export const ProgressReport: React.FC<ProgressReportProps> = ({
  playerIdentifier,
  weeklyData,
  onClose
}) => {
  const [startDate, setStartDate] = React.useState<string>('');
  const [endDate, setEndDate] = React.useState<string>('');
  const [showDateSelector, setShowDateSelector] = React.useState(false);

const findPlayerInWeek = (week: WeeklyData) => {
  // Only search by lord_id
  return week.players.find(p => String(p.lord_id) === String(playerIdentifier));
};


  // Get the player name for display
  const playerName = React.useMemo(() => {
    for (const week of weeklyData) {
      const player = findPlayerInWeek(week);
      if (player) return player.name;
    }
    return playerIdentifier;
  }, [weeklyData, playerIdentifier]);
  // Get available dates for this player
  const availableDates = React.useMemo(() => {
    const dates = weeklyData
      .filter(week => findPlayerInWeek(week) !== undefined)
      .map(week => week.date)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    return dates;
  }, [weeklyData, playerIdentifier]);

  // Initialize dates when component mounts
  React.useEffect(() => {
    if (availableDates.length >= 1 && !startDate && !endDate) {
      setStartDate(availableDates[0]);
      setEndDate(availableDates[availableDates.length - 1]);
    }
  }, [availableDates, startDate, endDate]);

  const calculateProgress = (): PlayerProgress | null => {
    console.log('ProgressReport - Alliance:', weeklyData[0]?.alliance_tag);
    console.log('ProgressReport - startDate:', startDate, 'endDate:', endDate);
    console.log('ProgressReport - availableDates:', availableDates);
    console.log('ProgressReport - weeklyData dates:', weeklyData.map(w => w.date));
    
    // Filter by selected date range
    const filteredWeeks = weeklyData
      .filter(week => {
        console.log('ProgressReport - checking week:', week.date);
        const weekDate = new Date(week.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        const inRange = weekDate >= start && weekDate <= end;
        console.log('ProgressReport - week in range:', inRange, 'weekDate:', weekDate, 'start:', start, 'end:', end);
        return inRange;
      });

    console.log('ProgressReport - filteredWeeks:', filteredWeeks.length);
    console.log('ProgressReport - filteredWeeks dates:', filteredWeeks.map(w => w.date));

    const playerWeeks = filteredWeeks
      .map(week => ({
        date: week.date,
        player: findPlayerInWeek(week),
        found: !!findPlayerInWeek(week),
        playerName: findPlayerInWeek(week)?.name || 'NOT FOUND'
      }))
      .filter(w => w.player)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log('ProgressReport - playerWeeks:', playerWeeks.length);
    console.log('ProgressReport - player found in weeks:', playerWeeks.map(w => ({
      date: w.date,
      found: w.found,
      playerName: w.playerName
    })));

    if (playerWeeks.length < 2) return null;

    const startWeek = playerWeeks[0];
    const endWeek = playerWeeks[playerWeeks.length - 1];

    return {
      startDate: startWeek.date,
      endDate: endWeek.date,
      startData: startWeek.player!,
      endData: endWeek.player!,
      changes: {
        powerChange: endWeek.player!.power - startWeek.player!.power,
        unitsKilledChange: endWeek.player!.units_killed - startWeek.player!.units_killed,
        unitsDeadChange: endWeek.player!.units_dead - startWeek.player!.units_dead,
        unitsHealedChange: endWeek.player!.units_healed - startWeek.player!.units_healed,
        goldSpentChange: endWeek.player!.gold_spent - startWeek.player!.gold_spent,
        woodSpentChange: endWeek.player!.wood_spent - startWeek.player!.wood_spent,
        stoneSpentChange: endWeek.player!.stone_spent - startWeek.player!.stone_spent,
        manaSpentChange: endWeek.player!.mana_spent - startWeek.player!.mana_spent,
        goldGatheredChange: endWeek.player!.gold - startWeek.player!.gold,
        woodGatheredChange: endWeek.player!.wood - startWeek.player!.wood,
        oreGatheredChange: endWeek.player!.ore - startWeek.player!.ore,
        manaGatheredChange: endWeek.player!.mana - startWeek.player!.mana,
        t5KillsChange: endWeek.player!.killcount_t5 - startWeek.player!.killcount_t5,
        t4KillsChange: endWeek.player!.killcount_t4 - startWeek.player!.killcount_t4,
        t3KillsChange: endWeek.player!.killcount_t3 - startWeek.player!.killcount_t3,
        t2KillsChange: endWeek.player!.killcount_t2 - startWeek.player!.killcount_t2,
        t1KillsChange: endWeek.player!.killcount_t1 - startWeek.player!.killcount_t1,
      }
    };
  };

  const progress = calculateProgress();

  const handleDateRangeChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setShowDateSelector(false);
  };

  const downloadPDF = async () => {
    const element = document.getElementById('progress-report');
    if (!element || !progress) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#1f2937',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${playerName}_Progress_Report_${progress.startDate}_to_${progress.endDate}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const formatChange = (value: number, showPlus: boolean = true) => {
    if (value === 0) return '0';
    const formatted = formatNumber(Math.abs(value));
    if (showPlus && value > 0) return `+${formatted}`;
    if (value < 0) return `-${formatted}`;
    return formatted;
  };

  if (!progress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Insufficient Data</h2>
          <p className="text-gray-400 mb-6">Need at least 2 weeks of data to generate a progress report.</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800/50 text-gray-300 border border-gray-600 rounded-lg
                     hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-300"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  const totalRSSSpent = progress.changes.goldSpentChange + progress.changes.woodSpentChange + 
                       progress.changes.stoneSpentChange + progress.changes.manaSpentChange;
  
  const totalRSSGathered = progress.changes.goldGatheredChange + progress.changes.woodGatheredChange + 
                          progress.changes.oreGatheredChange + progress.changes.manaGatheredChange;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-gray-900/80 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Progress Report</h1>
                <p className="text-gray-400">Season SOS5 Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={downloadPDF}
                disabled={!progress}
                className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed
                         hover:bg-green-700 transition-all duration-300 flex items-center gap-2"
              >
                <Download size={16} />
                Download PDF
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowDateSelector(!showDateSelector)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg
                           hover:bg-blue-700 transition-all duration-300 flex items-center gap-2"
                >
                  <Calendar size={16} />
                  Date Range
                  <ChevronDown size={16} className={`transform transition-transform ${showDateSelector ? 'rotate-180' : ''}`} />
                </button>
                
                {showDateSelector && (
                  <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg p-4 min-w-[300px] z-50">
                    <h4 className="text-white font-semibold mb-3">Select Date Range</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Start Date:</label>
                        <select
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                        >
                          {availableDates.map(date => (
                            <option key={date} value={date}>{date}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">End Date:</label>
                        <select
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                        >
                          {availableDates.filter(date => new Date(date) >= new Date(startDate)).map(date => (
                            <option key={date} value={date}>{date}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleDateRangeChange(availableDates[0], availableDates[availableDates.length - 1])}
                          className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
                        >
                          Full Range
                        </button>
                        <button
                          onClick={() => setShowDateSelector(false)}
                          className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-800/50 text-gray-300 border border-gray-600 rounded-lg
                         hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-300"
              >
                Back to Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Date Range Display */}
        {startDate && endDate && (
          <div className="glass-card p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-white">
              <Calendar className="text-blue-400" size={20} />
              <span className="font-medium">Report Period: {startDate} → {endDate}</span>
              {availableDates.length > 2 && (
                <span className="text-gray-400 text-sm ml-2">
                  ({availableDates.filter(date => new Date(date) >= new Date(startDate) && new Date(date) <= new Date(endDate)).length} weeks)
                </span>
              )}
            </div>
          </div>
        )}

        <div id="progress-report" className="bg-gray-800 rounded-2xl p-8 text-white">
          {/* Report Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">📈 Progress Report for [{progress?.endData.alliance_tag}] {playerName}</h1>
            <h2 className="text-xl text-gray-300">for season SOS5</h2>
          </div>

          {!progress && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg">No data available for the selected date range.</p>
              <p className="text-gray-500 text-sm mt-2">Please select a different date range with at least 2 data points.</p>
            </div>
          )}

          {progress && (
            <>
          {/* Core Stats */}
          <div className="space-y-6 mb-8">
            {/* Power */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">🟩</span>
              <span className="text-xl font-semibold">Power</span>
              <span className="text-xl ml-auto">{formatChange(progress.changes.powerChange)}</span>
            </div>

            {/* Kills */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚔️</span>
              <span className="text-xl font-semibold">Kills</span>
              <span className="text-xl ml-auto">{formatChange(progress.changes.unitsKilledChange)}</span>
            </div>

            {/* Deaths */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">💀</span>
              <span className="text-xl font-semibold">Deads</span>
              <span className="text-xl ml-auto">{formatChange(progress.changes.unitsDeadChange)}</span>
            </div>

            {/* Healed */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">❤️</span>
              <span className="text-xl font-semibold">Healed</span>
              <span className="text-xl ml-auto">{formatChange(progress.changes.unitsHealedChange)}</span>
            </div>
          </div>

          {/* Kill Breakdown */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">• Kill Breakdown</h3>
            <div className="pl-4 space-y-2">
              <div className="flex justify-between">
                <span>T5:</span>
                <span>{formatChange(progress.changes.t5KillsChange)}</span>
              </div>
              <div className="flex justify-between">
                <span>T4:</span>
                <span>{formatChange(progress.changes.t4KillsChange)}</span>
              </div>
              <div className="flex justify-between">
                <span>T3:</span>
                <span>{formatChange(progress.changes.t3KillsChange)}</span>
              </div>
              <div className="flex justify-between">
                <span>T2:</span>
                <span>{formatChange(progress.changes.t2KillsChange)}</span>
              </div>
              <div className="flex justify-between">
                <span>T1:</span>
                <span>{formatChange(progress.changes.t1KillsChange)}</span>
              </div>
            </div>
          </div>

          {/* RSS Spent */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>📦</span>
              RSS Spent
            </h3>
            <div className="pl-4 space-y-2">
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <span>🪙</span>
                  Gold:
                </span>
                <span>{formatNumber(progress.changes.goldSpentChange)}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <span>🪵</span>
                  Wood:
                </span>
                <span>{formatNumber(progress.changes.woodSpentChange)}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <span>⛏️</span>
                  Ore:
                </span>
                <span>{formatNumber(progress.changes.stoneSpentChange)}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <span>💧</span>
                  Mana:
                </span>
                <span>{formatNumber(progress.changes.manaSpentChange)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-gray-600 pt-2">
                <span className="flex items-center gap-2">
                  <span>📦</span>
                  Total:
                </span>
                <span>{formatNumber(totalRSSSpent)}</span>
              </div>
            </div>
          </div>

          {/* RSS Gathered */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>🧑‍🌾</span>
              RSS Gathered
            </h3>
            <div className="pl-4 space-y-2">
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <span>🪙</span>
                  Gold:
                </span>
                <span>{formatNumber(progress.changes.goldGatheredChange)}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <span>🪵</span>
                  Wood:
                </span>
                <span>{formatNumber(progress.changes.woodGatheredChange)}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <span>⛏️</span>
                  Ore:
                </span>
                <span>{formatNumber(progress.changes.oreGatheredChange)}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <span>💧</span>
                  Mana:
                </span>
                <span>{formatNumber(progress.changes.manaGatheredChange)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-gray-600 pt-2">
                <span className="flex items-center gap-2">
                  <span>📦</span>
                  Total:
                </span>
                <span>{formatNumber(totalRSSGathered)}</span>
              </div>
            </div>
          </div>

          {/* Timespan */}
          <div className="text-center pt-6 border-t border-gray-600">
            <div className="flex items-center justify-center gap-2 text-lg">
              <span>📅</span>
              <span>Timespan:</span>
              <span className="font-semibold">{progress.startDate} → {progress.endDate}</span>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};