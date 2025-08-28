import React, { useState, useMemo } from "react";
import {
  Trophy,
  Sword,
  Target,
  Heart,
  Eye,
  Gift,
  HandHeart,
  Zap,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  Calendar,
  Medal,
  Award,
  Star,
  Search,
  ChevronDown,
  ChevronUp,
  MapPin,
  Users,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { WeeklyData } from "../types";
import { formatNumber, formatNumberWithCommas } from "../utils/csvUtils";

interface AllianceLeaderboardProps {
  weeklyData: WeeklyData[];
}

interface PlayerStats {
  lord_id: string;
  name: string;
  alliance_tag: string;
  units_killed: number;
  units_dead: number;
  units_healed: number;
  scouted: number;
  resources_given: number;
  helps_given: number;
  mana_spent: number;
  killcount_t5: number;
  killcount_t1: number;
  merits: number;
  // Delta values for range mode
  delta?: number;
}

interface SearchResult {
  lord_id: string;
  name: string;
  rank: number;
  value: number;
}
type StatKey = keyof Omit<PlayerStats, "lord_id" | "name" | "alliance_tag">;

export const AllianceLeaderboard: React.FC<AllianceLeaderboardProps> = ({
  weeklyData,
}) => {
  const [activeTab, setActiveTab] = useState<StatKey>("units_killed");
  const [dateRange, setDateRange] = useState<"latest" | "range">("latest");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchPlayer, setSearchPlayer] = useState<string>("");
  const [showPlayerSearch, setShowPlayerSearch] = useState(false);
  const [foundPlayerRank, setFoundPlayerRank] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Get the alliance tag from the data
  const selectedAlliance =
    weeklyData.length > 0 ? weeklyData[0].alliance_tag : "";

  const tabs = [
    {
      key: "units_killed" as StatKey,
      label: "Units Killed",
      icon: Target,
      color: "text-red-400",
      neon: "shadow-red-500/50",
    },
    {
      key: "units_dead" as StatKey,
      label: "Units Dead",
      icon: Target,
      color: "text-orange-400",
      neon: "shadow-orange-500/50",
    },
    {
      key: "units_healed" as StatKey,
      label: "Units Healed",
      icon: Heart,
      color: "text-emerald-400",
      neon: "shadow-emerald-500/50",
    },
    {
      key: "scouted" as StatKey,
      label: "Scouted",
      icon: Eye,
      color: "text-blue-400",
      neon: "shadow-blue-500/50",
    },
    {
      key: "resources_given" as StatKey,
      label: "Resources Given",
      icon: Gift,
      color: "text-violet-400",
      neon: "shadow-violet-500/50",
    },
    {
      key: "helps_given" as StatKey,
      label: "Helps Given",
      icon: HandHeart,
      color: "text-pink-400",
      neon: "shadow-pink-500/50",
    },
    {
      key: "mana_spent" as StatKey,
      label: "Mana Spent",
      icon: Zap,
      color: "text-indigo-400",
      neon: "shadow-indigo-500/50",
    },
    {
      key: "killcount_t5" as StatKey,
      label: "T5 Kills",
      icon: Medal,
      color: "text-amber-400",
      neon: "shadow-amber-500/50",
    },
    {
      key: "killcount_t1" as StatKey,
      label: "T1 Kills",
      icon: Award,
      color: "text-lime-400",
      neon: "shadow-lime-500/50",
    },
    {
      key: "merits" as StatKey,
      label: "Merits",
      icon: Star,
      color: "text-purple-400",
      neon: "shadow-purple-500/50",
    },
  ];

  // Get available dates for date range selector
  const availableDates = useMemo(() => {
    return [...weeklyData]
      .map((week) => week.date)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [weeklyData]);

  // Initialize date range
  React.useEffect(() => {
    if (availableDates.length > 0 && !startDate && !endDate) {
      setStartDate(availableDates[0]);
      setEndDate(availableDates[availableDates.length - 1]);
    }
  }, [availableDates, startDate, endDate]);

  const playerStats = useMemo(() => {
    if (dateRange === "latest") {
      // Use most recent week only
      const sortedWeeks = [...weeklyData].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      if (sortedWeeks.length === 0) return [];
      const latestWeek = sortedWeeks[sortedWeeks.length - 1];

      console.log("AllianceLeaderboard - Using latest week:", latestWeek.date);

      return latestWeek.players.map((player) => ({
        lord_id: player.lord_id,
        name: player.name,
        alliance_tag: player.alliance_tag,
        units_killed: player.units_killed,
        units_dead: player.units_dead,
        units_healed: player.units_healed,
        scouted: player.scouted,
        resources_given: player.resources_given,
        helps_given: player.helps_given,
        mana_spent: player.mana_spent,
        killcount_t5: player.killcount_t5,
        killcount_t1: player.killcount_t1,
        merits: player.merits,
      }));
    } else {
      // Calculate DELTA (difference) across date range
      const filteredWeeks = weeklyData.filter((week) => {
        const weekDate = new Date(week.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return weekDate >= start && weekDate <= end;
      });

      // Sort weeks chronologically
      const sortedWeeks = filteredWeeks.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      console.log(
        "AllianceLeaderboard - Using date range:",
        startDate,
        "to",
        endDate
      );
      console.log("AllianceLeaderboard - Filtered weeks:", sortedWeeks.length);

      if (sortedWeeks.length < 2) {
        console.log(
          "AllianceLeaderboard - Need at least 2 weeks for delta calculation"
        );
        return [];
      }

      // Calculate delta between start and end dates
      const startWeek = sortedWeeks[0];
      const endWeek = sortedWeeks[sortedWeeks.length - 1];

      console.log(
        "AllianceLeaderboard - Start week:",
        startWeek.date,
        "End week:",
        endWeek.date
      );

      const playerMap = new Map<string, PlayerStats>();

      // Find players that exist in both start and end weeks
      endWeek.players.forEach((endPlayer) => {
        const startPlayer = startWeek.players.find(
          (p) => p.lord_id === endPlayer.lord_id
        );
        if (startPlayer) {
          // Calculate deltas
          const delta = endPlayer[activeTab] - startPlayer[activeTab];

          playerMap.set(endPlayer.lord_id, {
            lord_id: endPlayer.lord_id,
            name: endPlayer.name,
            alliance_tag: endPlayer.alliance_tag,
            units_killed: endPlayer.units_killed - startPlayer.units_killed,
            units_dead: endPlayer.units_dead - startPlayer.units_dead,
            units_healed: endPlayer.units_healed - startPlayer.units_healed,
            scouted: endPlayer.scouted - startPlayer.scouted,
            resources_given:
              endPlayer.resources_given - startPlayer.resources_given,
            helps_given: endPlayer.helps_given - startPlayer.helps_given,
            mana_spent: endPlayer.mana_spent - startPlayer.mana_spent,
            killcount_t5: endPlayer.killcount_t5 - startPlayer.killcount_t5,
            killcount_t1: endPlayer.killcount_t1 - startPlayer.killcount_t1,
            merits: endPlayer.merits - startPlayer.merits,
            delta: delta,
          });
        }
      });

      const result = Array.from(playerMap.values());
      console.log(
        "AllianceLeaderboard - Delta calculations completed for",
        result.length,
        "players"
      );
      return result;
    }
  }, [weeklyData, dateRange, startDate, endDate, activeTab]);

  const allSortedPlayers = useMemo(() => {
    return [...playerStats]
      .sort((a, b) => {
        if (dateRange === "range") {
          // For range mode, sort by delta values (can be negative)
          return (b.delta || 0) - (a.delta || 0);
        } else {
          // For latest mode, sort by actual values
          return b[activeTab] - a[activeTab];
        }
      })
      .map((player, index) => ({
        ...player,
        rank: index + 1,
      }));
  }, [playerStats, activeTab, dateRange]);

  // Search functionality with dropdown
  const handlePlayerSearch = (searchTerm: string) => {
    setSearchPlayer(searchTerm);

    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      setFoundPlayerRank(null);
      return;
    }

    const matches = allSortedPlayers
      .filter(
        (player) =>
          player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.lord_id.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5) // Show top 5 matches
      .map((player) => ({
        lord_id: player.lord_id,
        name: player.name,
        rank: player.rank,
        value: dateRange === "range" ? player.delta || 0 : player[activeTab],
      }));

    setSearchResults(matches);
    setShowSearchDropdown(matches.length > 0);

    // If exact match found, set the rank
    const exactMatch = matches.find(
      (m) =>
        m.name.toLowerCase() === searchTerm.toLowerCase() ||
        m.lord_id.toLowerCase() === searchTerm.toLowerCase()
    );
    setFoundPlayerRank(exactMatch ? exactMatch.rank : null);
  };

  const selectSearchResult = (result: SearchResult) => {
    setSearchPlayer(result.name);
    setFoundPlayerRank(result.rank);
    setShowSearchDropdown(false);
    setSearchResults([]);
  };

  const topPlayers = useMemo(() => {
    const limit = activeTab === "merits" ? 210 : 25;
    return allSortedPlayers.slice(0, limit);
  }, [allSortedPlayers, activeTab]);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          emoji: "🥇",
          glow: "shadow-yellow-500/50 border-yellow-500/50",
        };
      case 2:
        return { emoji: "🥈", glow: "shadow-gray-300/50 border-gray-300/50" };
      case 3:
        return {
          emoji: "🥉",
          glow: "shadow-orange-500/50 border-orange-500/50",
        };
      default:
        return {
          emoji: `#${rank}`,
          glow: "shadow-gray-600/30 border-gray-600/30",
        };
    }
  };

  const getStatColor = (statKey: StatKey) => {
    const tab = tabs.find((t) => t.key === statKey);
    return tab?.color || "text-white";
  };

  const renderDeltaIndicator = (value: number) => {
    if (value === 0) return <Minus className="text-gray-400" size={16} />;

    const isPositive = value > 0;
    const colorClass = isPositive ? "text-green-400" : "text-red-400";

    return (
      <div
        className={`flex items-center gap-1 ${colorClass} text-sm font-medium`}
      >
        {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        {isPositive ? "+" : ""}
        {formatNumber(value)}
      </div>
    );
  };

  const formatStatValue = (player: any, statKey: StatKey) => {
    if (dateRange === "range") {
      // Show delta value
      const deltaValue = player[statKey];
      return deltaValue;
    } else {
      // Show actual value
      return player[statKey];
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="p-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl shadow-2xl shadow-amber-500/25">
            <Medal className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {selectedAlliance} Player Leaderboard
            </h2>
            <p className="text-gray-400 mt-2">
              Top Players Performance Metrics
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card p-6 border-2 border-purple-500/20 relative z-10">
        <div className="space-y-6">
          {/* Date Range Controls */}
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar size={16} />
                <span>Alliance: {selectedAlliance}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Date Range Toggle */}
              <div className="flex bg-gray-800/50 rounded-lg p-1">
                <button
                  onClick={() => setDateRange("latest")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    dateRange === "latest"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Latest Week
                </button>
                <button
                  onClick={() => setDateRange("range")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    dateRange === "range"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Date Range
                </button>
              </div>

              {/* Date Range Selectors */}
              {dateRange === "range" && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-gray-300 text-sm">From:</label>
                    <select
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white text-sm"
                    >
                      {availableDates.map((date) => (
                        <option key={date} value={date}>
                          {date}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-gray-300 text-sm">To:</label>
                    <select
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white text-sm"
                    >
                      {availableDates
                        .filter((date) => new Date(date) >= new Date(startDate))
                        .map((date) => (
                          <option key={date} value={date}>
                            {date}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Player Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="text-sm text-gray-400">
              {dateRange === "latest"
                ? `Showing latest week: ${
                    [...weeklyData].sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )[0]?.date || "N/A"
                  }`
                : `Showing range: ${startDate} to ${endDate}`}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPlayerSearch(!showPlayerSearch)}
                className="px-4 py-2 bg-cyan-500/20 text-cyan-300 border border-cyan-400 rounded-lg
                         hover:bg-cyan-500/30 transition-all duration-300 flex items-center gap-2"
              >
                <MapPin size={16} />
                Find Player Rank
                {showPlayerSearch ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Player Search Input */}
          {showPlayerSearch && (
            <div className="glass-card p-4 border border-cyan-500/20 relative z-50">
              <div className="flex items-center gap-4 relative">
                <div className="flex-1">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search by player name or Lord ID..."
                    value={searchPlayer}
                    onChange={(e) => handlePlayerSearch(e.target.value)}
                    onFocus={() =>
                      searchResults.length > 0 && setShowSearchDropdown(true)
                    }
                    className="w-full pl-10 pr-4 py-2 bg-gray-800/90 border border-gray-600 rounded-lg text-white
                             focus:outline-none focus:border-cyan-400 transition-colors duration-300"
                  />

                  {/* Search Results Dropdown */}
                  {showSearchDropdown && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-[9999] max-h-60 overflow-y-auto backdrop-blur-sm">
                      {searchResults.map((result, index) => (
                        <button
                          key={result.lord_id}
                          onClick={() => selectSearchResult(result)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-700/80 transition-colors duration-200 border-b border-gray-700/30 last:border-b-0 relative z-[10000]"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-white font-medium">
                                {result.name}
                              </div>
                              <div className="text-gray-400 text-sm">
                                ID: {result.lord_id}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-cyan-300 font-bold">
                                #{result.rank}
                              </div>
                              <div
                                className={`text-sm ${getStatColor(activeTab)}`}
                              >
                                {dateRange === "range" &&
                                  result.value !== 0 && (
                                    <span
                                      className={
                                        result.value > 0
                                          ? "text-green-400"
                                          : "text-red-400"
                                      }
                                    >
                                      {result.value > 0 ? "+" : ""}
                                      {formatNumber(result.value)}
                                    </span>
                                  )}
                                {dateRange === "latest" &&
                                  formatNumber(result.value)}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {foundPlayerRank && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg">
                    <Trophy className="text-cyan-400" size={16} />
                    <span className="text-cyan-300 font-medium">
                      Rank #{foundPlayerRank} of {allSortedPlayers.length}
                    </span>
                  </div>
                )}
                {searchPlayer && !foundPlayerRank && (
                  <div className="px-4 py-2 bg-red-500/20 border border-red-400 rounded-lg">
                    <span className="text-red-300 text-sm">
                      Player not found
                    </span>
                  </div>
                )}
              </div>

              {/* Click outside to close dropdown */}
              {showSearchDropdown && (
                <div
                  className="fixed inset-0 z-[9998]"
                  onClick={() => setShowSearchDropdown(false)}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card p-2 border-2 border-cyan-500/20 relative z-20">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab.key
                  ? `bg-gradient-to-r from-gray-800 to-gray-700 ${tab.color} border border-current shadow-lg ${tab.neon}`
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <tab.icon size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="glass-card border-2 border-blue-500/20 overflow-hidden relative z-30">
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            {tabs.find((t) => t.key === activeTab) && (
              <>
                <div
                  className={`p-2 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow-lg ${
                    tabs.find((t) => t.key === activeTab)?.neon
                  }`}
                >
                  {React.createElement(
                    tabs.find((t) => t.key === activeTab)!.icon,
                    {
                      className: tabs.find((t) => t.key === activeTab)?.color,
                      size: 24,
                    }
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {tabs.find((t) => t.key === activeTab)?.label} Rankings
                  </h3>
                  {dateRange === "range" && (
                    <span className="text-lg text-cyan-300 ml-2">
                      (Δ Growth: {startDate} → {endDate})
                    </span>
                  )}
                  <p className="text-gray-400">
                    {dateRange === "latest"
                      ? `Top performing players in ${selectedAlliance}`
                      : `Growth leaders in ${selectedAlliance} • Showing progress between dates`}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-700/30">
          {topPlayers.map((player, index) => {
            const rankBadge = getRankBadge(player.rank);
            const isTopThree = player.rank <= 3;

            return (
              <div
                key={player.lord_id}
                className={`p-6 transition-all duration-300 hover:bg-gray-800/30 ${
                  isTopThree
                    ? `border-l-4 ${
                        player.rank === 1
                          ? "border-yellow-500 bg-yellow-500/5"
                          : player.rank === 2
                          ? "border-gray-300 bg-gray-300/5"
                          : "border-orange-500 bg-orange-500/5"
                      }`
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {/* Rank Badge */}
                    <div
                      className={`flex items-center justify-center w-16 h-16 rounded-2xl border-2 ${
                        rankBadge.glow
                      } ${
                        isTopThree ? "shadow-2xl" : ""
                      } bg-gradient-to-br from-gray-800 to-gray-900`}
                    >
                      <span
                        className={`text-2xl font-bold ${
                          player.rank <= 3 ? "text-white" : "text-gray-300"
                        }`}
                      >
                        {rankBadge.emoji}
                      </span>
                    </div>

                    {/* Player Info */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-bold text-white">
                          {player.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">
                          Lord ID: {player.lord_id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stat Value */}
                  <div className="text-right">
                    <div className="mb-1">
                      {dateRange === "range" ? (
                        <div
                          className={`text-3xl font-bold mb-2 ${
                            player[activeTab] > 0
                              ? "text-green-400"
                              : player[activeTab] < 0
                              ? "text-red-400"
                              : "text-gray-400"
                          }`}
                        >
                          {player[activeTab] > 0 ? "+" : ""}
                          {activeTab === "mana_spent" ||
                          activeTab === "resources_given"
                            ? formatNumber(player[activeTab])
                            : formatNumberWithCommas(player[activeTab])}
                        </div>
                      ) : (
                        <div
                          className={`text-3xl font-bold ${getStatColor(
                            activeTab
                          )}`}
                        >
                          {activeTab === "mana_spent" ||
                          activeTab === "resources_given"
                            ? formatNumber(player[activeTab])
                            : formatNumberWithCommas(player[activeTab])}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      {dateRange === "range"
                        ? "Growth"
                        : tabs.find((t) => t.key === activeTab)?.label}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                    {dateRange === "range" ? (
                      // For range mode, show progress based on absolute delta values
                      <div
                        className={`h-full transition-all duration-1000 ease-out ${
                          player[activeTab] > 0
                            ? "bg-gradient-to-r from-green-500 to-green-600"
                            : player[activeTab] < 0
                            ? "bg-gradient-to-r from-red-500 to-red-600"
                            : "bg-gradient-to-r from-gray-500 to-gray-600"
                        }`}
                        style={{
                          width: `${
                            (Math.abs(player[activeTab]) /
                              Math.max(
                                ...topPlayers.map((p) => Math.abs(p[activeTab]))
                              )) *
                            100
                          }%`,
                        }}
                      />
                    ) : (
                      // For latest mode, show normal progress
                      <div
                        className={`h-full bg-gradient-to-r transition-all duration-1000 ease-out ${
                          player.rank === 1
                            ? "from-yellow-500 to-yellow-600"
                            : player.rank === 2
                            ? "from-gray-300 to-gray-400"
                            : player.rank === 3
                            ? "from-orange-500 to-orange-600"
                            : "from-blue-500 to-purple-600"
                        }`}
                        style={{
                          width: `${
                            (player[activeTab] /
                              Math.max(
                                ...topPlayers.map((p) => p[activeTab])
                              )) *
                            100
                          }%`,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {topPlayers.length === 0 && (
          <div className="p-12 text-center">
            <Trophy className="mx-auto text-gray-500 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">
              No Data Available
            </h3>
            <p className="text-gray-500">
              No player data found for {selectedAlliance}.
            </p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="glass-card p-6 border border-gray-600/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="text-blue-400" size={20} />
            </div>
            <div>
              <h4 className="text-white font-semibold">Leaderboard Stats</h4>
              <p className="text-gray-400 text-sm">
                {dateRange === "latest"
                  ? "Latest week rankings"
                  : `Aggregated from ${startDate} to ${endDate}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {allSortedPlayers.length}
            </div>
            <div className="text-sm text-gray-400">Total Players</div>
          </div>
        </div>
      </div>
    </div>
  );
};
