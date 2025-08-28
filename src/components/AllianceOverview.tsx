import React from "react";
import {
  Shield,
  Crown,
  Zap,
  Sword,
  Users,
  TrendingUp,
  Calendar,
  BarChart3,
  Gauge,
  Flame,
  Target,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { WeeklyData } from "../types";
import {
  formatNumber,
  formatLargeNumber,
  formatPowerNumber,
} from "../utils/csvUtils";

interface AllianceOverviewProps {
  weeklyData: WeeklyData[];
  selectedAlliance: string;
}

interface AllianceStats {
  date: string;
  formattedDate: string;
  totalPower: number;
  totalManaSpent: number;
  totalKills: number;
  playerCount: number;
  top250Power: number;
  top250ManaSpent: number;
  top250Kills: number;
}

export const AllianceOverview: React.FC<AllianceOverviewProps> = ({
  weeklyData,
  selectedAlliance,
}) => {
  // Debug logging
  console.log("AllianceOverview - selectedAlliance:", selectedAlliance);
  console.log("AllianceOverview - weeklyData:", weeklyData);
  console.log("AllianceOverview - weeklyData length:", weeklyData.length);

  if (weeklyData.length > 0) {
    console.log("AllianceOverview - first week sample:", {
      date: weeklyData[0].date,
      alliance_tag: weeklyData[0].alliance_tag,
      playerCount: weeklyData[0].players.length,
      samplePlayers: weeklyData[0].players.slice(0, 3).map((p) => ({
        name: p.name,
        alliance_tag: p.alliance_tag,
        power: p.power,
      })),
    });
    console.log("AllianceOverview - latest week sample:", {
      date: weeklyData[weeklyData.length - 1].date,
      alliance_tag: weeklyData[weeklyData.length - 1].alliance_tag,
      playerCount: weeklyData[weeklyData.length - 1].players.length,
    });
  }

  const allianceStats = React.useMemo(() => {
    console.log("AllianceOverview - Processing alliance stats...");
    // Sort by date first to ensure proper chronological order
    const sortedWeeks = [...weeklyData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sortedWeeks.map((week) => {
      console.log(
        "AllianceOverview - Processing week:",
        week.date,
        "alliance_tag:",
        week.alliance_tag
      );

      // Since we're already loading alliance-specific data, use all players
      const alliancePlayers = week.players;
      console.log(
        "AllianceOverview - Alliance players count:",
        alliancePlayers.length
      );

      // Sort by power and take top 250
      const top250Players = alliancePlayers
        .sort((a, b) => b.power - a.power)
        .slice(0, 250);

      console.log(
        "AllianceOverview - Top 250 players count:",
        top250Players.length
      );

      const totalPower = alliancePlayers.reduce((sum, p) => sum + p.power, 0);
      const totalManaSpent = alliancePlayers.reduce(
        (sum, p) => sum + p.mana_spent,
        0
      );
      const totalKills = alliancePlayers.reduce(
        (sum, p) => sum + p.units_killed,
        0
      );

      const top250Power = top250Players.reduce((sum, p) => sum + p.power, 0);
      const top250ManaSpent = top250Players.reduce(
        (sum, p) => sum + p.mana_spent,
        0
      );
      const top250Kills = top250Players.reduce(
        (sum, p) => sum + p.units_killed,
        0
      );

      const result = {
        date: week.date,
        formattedDate: week.date.split("-").slice(1).join("/"),
        totalPower,
        totalManaSpent,
        totalKills,
        playerCount: alliancePlayers.length,
        top250Power,
        top250ManaSpent,
        top250Kills,
      };

      console.log("AllianceOverview - Week result:", result);
      return result;
    });
  }, [weeklyData, selectedAlliance]);

  console.log("AllianceOverview - Final alliance stats:", allianceStats);

  const currentStats = allianceStats[allianceStats.length - 1];
  const previousStats =
    allianceStats.length > 1 ? allianceStats[allianceStats.length - 2] : null;

  console.log("AllianceOverview - Current stats:", currentStats);
  console.log("AllianceOverview - Previous stats:", previousStats);

  const renderChangeIndicator = (
    current: number,
    previous: number | undefined
  ) => {
    if (!previous) return null;
    const change = current - previous;
    const isPositive = change > 0;

    return (
      <div
        className={`text-sm flex items-center gap-1 ${
          isPositive ? "text-green-400" : "text-red-400"
        }`}
      >
        <TrendingUp size={12} className={isPositive ? "" : "rotate-180"} />
        {isPositive ? "+" : ""}
        {formatNumber(change)}
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
              {`${entry.name}: ${formatNumber(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!currentStats) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-gray-400">No alliance data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current Stats Overview */}
      <div className="glass-card p-8 border-2 border-purple-500/20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
              <Gauge className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                Alliance Performance
              </h3>
              <p className="text-purple-300">Top 250 Elite Warriors</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Last Updated</div>
            <div className="text-white font-semibold">{currentStats.date}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="glass-card p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Crown className="text-yellow-400" size={24} />
              </div>
              <span className="text-gray-300 font-medium">Total Power</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {formatPowerNumber(currentStats.top250Power)}
            </div>
            {previousStats &&
              renderChangeIndicator(
                currentStats.top250Power,
                previousStats.top250Power
              )}
          </div>

          <div className="glass-card p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-violet-500/20 rounded-lg">
                <Activity className="text-violet-400" size={24} />
              </div>
              <span className="text-gray-300 font-medium">Mana Spent</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {formatLargeNumber(currentStats.top250ManaSpent)}
            </div>
            {previousStats &&
              renderChangeIndicator(
                currentStats.top250ManaSpent,
                previousStats.top250ManaSpent
              )}
          </div>

          <div className="glass-card p-6 border border-red-500/20 hover:border-red-500/40 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-rose-500/20 rounded-lg">
                <Target className="text-rose-400" size={24} />
              </div>
              <span className="text-gray-300 font-medium">Total Kills</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {formatLargeNumber(currentStats.top250Kills)}
            </div>
            {previousStats &&
              renderChangeIndicator(
                currentStats.top250Kills,
                previousStats.top250Kills
              )}
          </div>

          <div className="glass-card p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="text-blue-400" size={24} />
              </div>
              <span className="text-gray-300 font-medium">Active Players</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {currentStats.playerCount}
            </div>
            <div className="text-sm text-blue-300 font-medium">
              Top 210: {Math.min(currentStats.playerCount, 210)}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Power Chart */}
        <div className="glass-card p-6 border border-yellow-500/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Flame className="text-amber-400" size={20} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">
                Alliance Power Evolution
              </h4>
              <p className="text-sm text-gray-400">Top 250 Warriors Combined</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={allianceStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="formattedDate"
                  stroke="#9ca3af"
                  fontSize={12}
                  tick={{ fill: "#9ca3af" }}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tick={{ fill: "#9ca3af" }}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="top250Power"
                  stroke="#fbbf24"
                  strokeWidth={3}
                  dot={{ fill: "#fbbf24", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#fbbf24", strokeWidth: 2 }}
                  name="Power"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mana Spent Chart */}
        <div className="glass-card p-6 border border-purple-500/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Zap className="text-purple-400" size={20} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">
                Mana Expenditure
              </h4>
              <p className="text-sm text-gray-400">Strategic Resource Usage</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={allianceStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="formattedDate"
                  stroke="#9ca3af"
                  fontSize={12}
                  tick={{ fill: "#9ca3af" }}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tick={{ fill: "#9ca3af" }}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="top250ManaSpent"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2 }}
                  name="Mana Spent"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Kills Chart */}
        <div className="glass-card p-6 border border-red-500/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Sword className="text-red-400" size={20} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">
                Combat Dominance
              </h4>
              <p className="text-sm text-gray-400">Total Enemy Eliminations</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={allianceStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="formattedDate"
                  stroke="#9ca3af"
                  fontSize={12}
                  tick={{ fill: "#9ca3af" }}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tick={{ fill: "#9ca3af" }}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="top250Kills"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#ef4444", strokeWidth: 2 }}
                  name="Total Kills"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Combined Overview Chart */}
        <div className="glass-card p-6 border border-blue-500/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Calendar className="text-blue-400" size={20} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">
                Member Activity
              </h4>
              <p className="text-sm text-gray-400">Active Player Count</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allianceStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="formattedDate"
                  stroke="#9ca3af"
                  fontSize={12}
                  tick={{ fill: "#9ca3af" }}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tick={{ fill: "#9ca3af" }}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="playerCount"
                  fill="#3b82f6"
                  name="Active Players"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Stats Table */}
      <div className="glass-card p-8 border border-gray-600/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-500/20 rounded-lg">
            <BarChart3 className="text-gray-400" size={20} />
          </div>
          <div>
            <h4 className="text-xl font-semibold text-white">
              Historical Performance Data
            </h4>
            <p className="text-sm text-gray-400">
              Comprehensive alliance metrics over time • Latest:{" "}
              {currentStats.date}
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-600">
                <th className="text-left py-4 px-6 text-gray-300 font-semibold">
                  Date
                </th>
                <th className="text-left py-4 px-6 text-gray-300 font-semibold">
                  Active Players
                </th>
                <th className="text-left py-4 px-6 text-gray-300 font-semibold">
                  Total Power
                </th>
                <th className="text-left py-4 px-6 text-gray-300 font-semibold">
                  Mana Spent
                </th>
                <th className="text-left py-4 px-6 text-gray-300 font-semibold">
                  Total Kills
                </th>
              </tr>
            </thead>
            <tbody>
              {allianceStats.map((stats, index) => {
                const prevStats = index > 0 ? allianceStats[index - 1] : null;
                return (
                  <tr
                    key={stats.date}
                    className="border-b border-gray-700/30 hover:bg-gray-800/20 transition-colors duration-200"
                  >
                    <td className="py-4 px-6 text-white font-medium">
                      {stats.date}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white font-medium">
                        {stats.playerCount}
                      </div>
                      <div className="text-xs text-gray-400">
                        Top 250: {Math.min(stats.playerCount, 250)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white font-medium">
                        {formatNumber(stats.top250Power)}
                      </div>
                      {prevStats && (
                        <div className="text-xs text-green-400">
                          +
                          {formatPowerNumber(
                            stats.top250Power - prevStats.top250Power
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white font-medium">
                        {formatLargeNumber(stats.top250ManaSpent)}
                      </div>
                      {prevStats && (
                        <div className="text-xs text-purple-400">
                          +
                          {formatLargeNumber(
                            stats.top250ManaSpent - prevStats.top250ManaSpent
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white font-medium">
                        {formatLargeNumber(stats.top250Kills)}
                      </div>
                      {prevStats && (
                        <div className="text-xs text-red-400">
                          +
                          {formatLargeNumber(
                            stats.top250Kills - prevStats.top250Kills
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
