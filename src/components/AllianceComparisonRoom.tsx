import React, { useState, useMemo } from "react";
import {
  X,
  Scale,
  Calendar,
  BarChart3,
  Trophy,
  Sword,
  Target,
  Heart,
  Zap,
  Crown,
  TrendingUp,
  TrendingDown,
  Users,
  Filter,
  Download,
  RefreshCw,
  ArrowRight,
  Medal,
  Star,
  Flame,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { WeeklyData, AllianceFile } from "../types";
import {
  getAllianceFiles,
  loadCSVFile,
  formatNumber,
  formatLargeNumber,
} from "../utils/csvUtils";

interface AllianceComparisonRoomProps {
  onClose: () => void;
}

interface DateRangeComparison {
  alliance: string;
  startDate: string;
  endDate: string;
  files: string[];
  aggregatedStats: {
    totalPower: number;
    totalKills: number;
    totalDeads: number;
    totalHealed: number;
    totalManaSpent: number;
    totalT5Kills: number;
    playerCount: number;
    avgPower: number;
    avgKills: number;
    avgDeads: number;
    avgHealed: number;
    avgManaSpent: number;
    avgT5Kills: number;
    growthMetrics: {
      powerGrowth: number;
      killsGrowth: number;
      deadsGrowth: number;
      healedGrowth: number;
      manaSpentGrowth: number;
      t5KillsGrowth: number;
    };
  };
}

interface AllianceComparisonData {
  alliance: string;
  date: string;
  fileName: string;
  top250Stats: {
    totalPower: number;
    totalKills: number;
    totalDeads: number;
    totalHealed: number;
    totalManaSpent: number;
    totalT5Kills: number;
    playerCount: number;
    avgPower: number;
    avgKills: number;
    avgDeads: number;
    avgHealed: number;
    avgManaSpent: number;
    avgT5Kills: number;
  };
}

export const AllianceComparisonRoom: React.FC<AllianceComparisonRoomProps> = ({
  onClose,
}) => {
  const [availableFiles, setAvailableFiles] = useState<AllianceFile[]>([]);
  const [comparisonMode, setComparisonMode] = useState<"single" | "range">(
    "single"
  );
  const [selectedFile1, setSelectedFile1] = useState<string>("");
  const [selectedFile2, setSelectedFile2] = useState<string>("");
  const [selectedAlliance1, setSelectedAlliance1] = useState<string>("");
  const [selectedAlliance2, setSelectedAlliance2] = useState<string>("");
  const [startDate1, setStartDate1] = useState<string>("");
  const [endDate1, setEndDate1] = useState<string>("");
  const [startDate2, setStartDate2] = useState<string>("");
  const [endDate2, setEndDate2] = useState<string>("");
  const [comparisonData, setComparisonData] = useState<{
    alliance1: AllianceComparisonData | null;
    alliance2: AllianceComparisonData | null;
  }>({ alliance1: null, alliance2: null });
  const [rangeComparisonData, setRangeComparisonData] = useState<{
    alliance1: DateRangeComparison | null;
    alliance2: DateRangeComparison | null;
  }>({ alliance1: null, alliance2: null });
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>("totalPower");

  React.useEffect(() => {
    const loadFiles = async () => {
      try {
        const files = await getAllianceFiles();
        setAvailableFiles(files);
        console.log("Available files for comparison:", files);
      } catch (error) {
        console.error("Error loading alliance files:", error);
      }
    };

    loadFiles();
  }, []);

  // Get unique alliances from available files
  const availableAlliances = useMemo(() => {
    const alliances = [
      ...new Set(availableFiles.map((file) => file.alliance_tag)),
    ];
    return alliances.sort();
  }, [availableFiles]);

  // Get available dates for selected alliance
  const getAvailableDatesForAlliance = (alliance: string) => {
    return availableFiles
      .filter((file) => file.alliance_tag === alliance)
      .map((file) => file.date)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  };

  const loadAllianceData = async (
    fileName: string
  ): Promise<AllianceComparisonData> => {
    const weeklyData = await loadCSVFile(fileName);

    // Get top 250 players by power
    const top250Players = weeklyData.players
      .sort((a, b) => b.power - a.power)
      .slice(0, 250);

    const stats = {
      totalPower: top250Players.reduce((sum, p) => sum + p.power, 0),
      totalKills: top250Players.reduce((sum, p) => sum + p.units_killed, 0),
      totalDeads: top250Players.reduce((sum, p) => sum + p.units_dead, 0),
      totalHealed: top250Players.reduce((sum, p) => sum + p.units_healed, 0),
      totalManaSpent: top250Players.reduce((sum, p) => sum + p.mana_spent, 0),
      totalT5Kills: top250Players.reduce((sum, p) => sum + p.killcount_t5, 0),
      playerCount: top250Players.length,
      avgPower:
        top250Players.length > 0
          ? top250Players.reduce((sum, p) => sum + p.power, 0) /
            top250Players.length
          : 0,
      avgKills:
        top250Players.length > 0
          ? top250Players.reduce((sum, p) => sum + p.units_killed, 0) /
            top250Players.length
          : 0,
      avgDeads:
        top250Players.length > 0
          ? top250Players.reduce((sum, p) => sum + p.units_dead, 0) /
            top250Players.length
          : 0,
      avgHealed:
        top250Players.length > 0
          ? top250Players.reduce((sum, p) => sum + p.units_healed, 0) /
            top250Players.length
          : 0,
      avgManaSpent:
        top250Players.length > 0
          ? top250Players.reduce((sum, p) => sum + p.mana_spent, 0) /
            top250Players.length
          : 0,
      avgT5Kills:
        top250Players.length > 0
          ? top250Players.reduce((sum, p) => sum + p.killcount_t5, 0) /
            top250Players.length
          : 0,
    };

    return {
      alliance: weeklyData.alliance_tag,
      date: weeklyData.date,
      fileName,
      top250Stats: stats,
    };
  };

  const loadDateRangeData = async (
    alliance: string,
    startDate: string,
    endDate: string
  ): Promise<DateRangeComparison> => {
    const relevantFiles = availableFiles.filter(
      (file) =>
        file.alliance_tag === alliance &&
        new Date(file.date) >= new Date(startDate) &&
        new Date(file.date) <= new Date(endDate)
    );

    if (relevantFiles.length === 0) {
      throw new Error(
        `No files found for ${alliance} between ${startDate} and ${endDate}`
      );
    }

    // Load all files in the date range
    const weeklyDataArray = await Promise.all(
      relevantFiles.map((file) => loadCSVFile(file.filename))
    );

    // Sort by date
    weeklyDataArray.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstWeek = weeklyDataArray[0];
    const lastWeek = weeklyDataArray[weeklyDataArray.length - 1];

    // Get top 250 players from the latest week in range
    const top250Players = lastWeek.players
      .sort((a, b) => b.power - a.power)
      .slice(0, 250);

    // Calculate aggregated stats
    const totalStats = {
      totalPower: top250Players.reduce((sum, p) => sum + p.power, 0),
      totalKills: top250Players.reduce((sum, p) => sum + p.units_killed, 0),
      totalDeads: top250Players.reduce((sum, p) => sum + p.units_dead, 0),
      totalHealed: top250Players.reduce((sum, p) => sum + p.units_healed, 0),
      totalManaSpent: top250Players.reduce((sum, p) => sum + p.mana_spent, 0),
      totalT5Kills: top250Players.reduce((sum, p) => sum + p.killcount_t5, 0),
      playerCount: top250Players.length,
      avgPower:
        top250Players.length > 0
          ? top250Players.reduce((sum, p) => sum + p.power, 0) /
            top250Players.length
          : 0,
      avgKills:
        top250Players.length > 0
          ? top250Players.reduce((sum, p) => sum + p.units_killed, 0) /
            top250Players.length
          : 0,
      avgDeads:
        top250Players.length > 0
          ? top250Players.reduce((sum, p) => sum + p.units_dead, 0) /
            top250Players.length
          : 0,
      avgHealed:
        top250Players.length > 0
          ? top250Players.reduce((sum, p) => sum + p.units_healed, 0) /
            top250Players.length
          : 0,
      avgManaSpent:
        top250Players.length > 0
          ? top250Players.reduce((sum, p) => sum + p.mana_spent, 0) /
            top250Players.length
          : 0,
      avgT5Kills:
        top250Players.length > 0
          ? top250Players.reduce((sum, p) => sum + p.killcount_t5, 0) /
            top250Players.length
          : 0,
    };

    // Calculate growth metrics if we have multiple weeks
    let growthMetrics = {
      powerGrowth: 0,
      killsGrowth: 0,
      deadsGrowth: 0,
      healedGrowth: 0,
      manaSpentGrowth: 0,
      t5KillsGrowth: 0,
    };

    if (weeklyDataArray.length > 1) {
      const firstWeekTop250 = firstWeek.players
        .sort((a, b) => b.power - a.power)
        .slice(0, 250);

      const firstWeekStats = {
        totalPower: firstWeekTop250.reduce((sum, p) => sum + p.power, 0),
        totalKills: firstWeekTop250.reduce((sum, p) => sum + p.units_killed, 0),
        totalDeads: firstWeekTop250.reduce((sum, p) => sum + p.units_dead, 0),
        totalHealed: firstWeekTop250.reduce(
          (sum, p) => sum + p.units_healed,
          0
        ),
        totalManaSpent: firstWeekTop250.reduce(
          (sum, p) => sum + p.mana_spent,
          0
        ),
        totalT5Kills: firstWeekTop250.reduce(
          (sum, p) => sum + p.killcount_t5,
          0
        ),
      };

      growthMetrics = {
        powerGrowth: totalStats.totalPower - firstWeekStats.totalPower,
        killsGrowth: totalStats.totalKills - firstWeekStats.totalKills,
        deadsGrowth: totalStats.totalDeads - firstWeekStats.totalDeads,
        healedGrowth: totalStats.totalHealed - firstWeekStats.totalHealed,
        manaSpentGrowth:
          totalStats.totalManaSpent - firstWeekStats.totalManaSpent,
        t5KillsGrowth: totalStats.totalT5Kills - firstWeekStats.totalT5Kills,
      };
    }

    return {
      alliance,
      startDate,
      endDate,
      files: relevantFiles.map((f) => f.filename),
      aggregatedStats: {
        ...totalStats,
        growthMetrics,
      },
    };
  };

  const handleCompare = async () => {
    if (comparisonMode === "single") {
      if (!selectedFile1 || !selectedFile2) return;
    } else {
      if (
        !selectedAlliance1 ||
        !selectedAlliance2 ||
        !startDate1 ||
        !endDate1 ||
        !startDate2 ||
        !endDate2
      )
        return;
    }

    setLoading(true);
    try {
      if (comparisonMode === "single") {
        const [data1, data2] = await Promise.all([
          loadAllianceData(selectedFile1),
          loadAllianceData(selectedFile2),
        ]);

        setComparisonData({
          alliance1: data1,
          alliance2: data2,
        });
        setRangeComparisonData({ alliance1: null, alliance2: null });
      } else {
        const [rangeData1, rangeData2] = await Promise.all([
          loadDateRangeData(selectedAlliance1, startDate1, endDate1),
          loadDateRangeData(selectedAlliance2, startDate2, endDate2),
        ]);

        setRangeComparisonData({
          alliance1: rangeData1,
          alliance2: rangeData2,
        });
        setComparisonData({ alliance1: null, alliance2: null });
      }
    } catch (error) {
      console.error("Error loading comparison data:", error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    {
      key: "totalPower",
      label: "Total Power",
      icon: Crown,
      color: "text-yellow-400",
    },
    {
      key: "totalKills",
      label: "Total Kills",
      icon: Sword,
      color: "text-red-400",
    },
    {
      key: "totalDeads",
      label: "Total Deaths",
      icon: Target,
      color: "text-orange-400",
    },
    {
      key: "totalHealed",
      label: "Total Healed",
      icon: Heart,
      color: "text-green-400",
    },
    {
      key: "totalManaSpent",
      label: "Total Mana Spent",
      icon: Zap,
      color: "text-purple-400",
    },
    {
      key: "totalT5Kills",
      label: "Total T5 Kills",
      icon: Medal,
      color: "text-amber-400",
    },
  ];

  const renderComparisonChart = () => {
    const data1 = comparisonData.alliance1 || rangeComparisonData.alliance1;
    const data2 = comparisonData.alliance2 || rangeComparisonData.alliance2;

    if (!data1 || !data2) return null;

    const chartData = metrics.map((metric) => ({
      metric: metric.label,
      alliance1:
        comparisonMode === "single"
          ? (data1 as AllianceComparisonData).top250Stats[
              metric.key as keyof AllianceComparisonData["top250Stats"]
            ]
          : (data1 as DateRangeComparison).aggregatedStats[
              metric.key as keyof DateRangeComparison["aggregatedStats"]
            ],
      alliance2:
        comparisonMode === "single"
          ? (data2 as AllianceComparisonData).top250Stats[
              metric.key as keyof AllianceComparisonData["top250Stats"]
            ]
          : (data2 as DateRangeComparison).aggregatedStats[
              metric.key as keyof DateRangeComparison["aggregatedStats"]
            ],
    }));

    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="metric"
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: "#9ca3af" }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: "#9ca3af" }}
              tickFormatter={(value) => formatNumber(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: any) => [formatNumber(value), ""]}
            />
            <Bar dataKey="alliance1" fill="#3b82f6" name={data1.alliance} />
            <Bar dataKey="alliance2" fill="#f97316" name={data2.alliance} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderRadarChart = () => {
    const data1 = comparisonData.alliance1 || rangeComparisonData.alliance1;
    const data2 = comparisonData.alliance2 || rangeComparisonData.alliance2;

    if (!data1 || !data2) return null;

    const radarData = metrics.map((metric) => {
      const value1 =
        comparisonMode === "single"
          ? (data1 as AllianceComparisonData).top250Stats[
              metric.key as keyof AllianceComparisonData["top250Stats"]
            ]
          : (data1 as DateRangeComparison).aggregatedStats[
              metric.key as keyof DateRangeComparison["aggregatedStats"]
            ];
      const value2 =
        comparisonMode === "single"
          ? (data2 as AllianceComparisonData).top250Stats[
              metric.key as keyof AllianceComparisonData["top250Stats"]
            ]
          : (data2 as DateRangeComparison).aggregatedStats[
              metric.key as keyof DateRangeComparison["aggregatedStats"]
            ];
      const max = Math.max(value1, value2);

      return {
        metric: metric.label.replace("Total ", ""),
        alliance1: max > 0 ? (value1 / max) * 100 : 0,
        alliance2: max > 0 ? (value2 / max) * 100 : 0,
      };
    });

    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: "#9ca3af", fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: "#9ca3af", fontSize: 10 }}
              tickFormatter={() => ""}
            />
            <Radar
              name={data1.alliance}
              dataKey="alliance1"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Radar
              name={data2.alliance}
              dataKey="alliance2"
              stroke="#f97316"
              fill="#f97316"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderStatComparison = (
    label: string,
    value1: number,
    value2: number,
    icon: React.ComponentType<any>,
    color: string,
    isAverage: boolean = false
  ) => {
    const max = Math.max(value1, value2);
    const percentage1 = max > 0 ? (value1 / max) * 100 : 0;
    const percentage2 = max > 0 ? (value2 / max) * 100 : 0;
    const winner = value1 > value2 ? 1 : value2 > value1 ? 2 : 0;

    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          {React.createElement(icon, { className: color, size: 24 })}
          <h4 className="text-white font-semibold text-lg">{label}</h4>
          {winner > 0 && (
            <div
              className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
                winner === 1
                  ? "bg-blue-500/20 text-blue-300"
                  : "bg-orange-500/20 text-orange-300"
              }`}
            >
              {winner === 1
                ? comparisonData.alliance1?.alliance
                : comparisonData.alliance2?.alliance}{" "}
              Leads
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-blue-300 font-medium">
                {comparisonData.alliance1?.alliance}
              </span>
            </div>
            <div className="text-white font-bold text-lg">
              {isAverage ? formatNumber(value1) : formatLargeNumber(value1)}
            </div>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${percentage1}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-orange-300 font-medium">
                {comparisonData.alliance2?.alliance}
              </span>
            </div>
            <div className="text-white font-bold text-lg">
              {isAverage ? formatNumber(value2) : formatLargeNumber(value2)}
            </div>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
              style={{ width: `${percentage2}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-gray-900/80 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl">
                <Scale className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Alliance Comparison Room
                </h1>
                <p className="text-gray-400">
                  Compare top 250 players between alliances
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-800/50 text-gray-300 border border-gray-600 rounded-lg
                       hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-300 flex items-center gap-2"
            >
              <X size={16} />
              Exit Room
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* File Selection */}
        <div className="glass-card p-8 border-2 border-cyan-500/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Calendar className="text-cyan-400" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                Alliance Comparison Setup
              </h3>
              <p className="text-gray-400">
                Compare top 250 players between alliances using single files or
                date ranges
              </p>
            </div>
          </div>

          {/* Comparison Mode Toggle */}
          <div className="mb-8">
            <div className="flex bg-gray-800/50 rounded-lg p-1 w-fit">
              <button
                onClick={() => setComparisonMode("single")}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-300 ${
                  comparisonMode === "single"
                    ? "bg-cyan-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Single File Comparison
              </button>
              <button
                onClick={() => setComparisonMode("range")}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-300 ${
                  comparisonMode === "range"
                    ? "bg-cyan-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Date Range Comparison
              </button>
            </div>
            <p className="text-gray-500 text-sm mt-2">
              {comparisonMode === "single"
                ? "Compare specific data files from different dates"
                : "Compare alliance performance over date ranges with growth metrics"}
            </p>
          </div>

          {comparisonMode === "single" ? (
            /* Single File Mode */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-white font-semibold mb-3">
                  Alliance 1 Data
                </label>
                <select
                  value={selectedFile1}
                  onChange={(e) => setSelectedFile1(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white
                         focus:outline-none focus:border-cyan-400 transition-colors duration-300"
                >
                  <option value="">Select first alliance file...</option>
                  {availableFiles.map((file) => (
                    <option key={file.filename} value={file.filename}>
                      [{file.alliance_tag}] {file.date} - {file.filename}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white font-semibold mb-3">
                  Alliance 2 Data
                </label>
                <select
                  value={selectedFile2}
                  onChange={(e) => setSelectedFile2(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white
                         focus:outline-none focus:border-cyan-400 transition-colors duration-300"
                >
                  <option value="">Select second alliance file...</option>
                  {availableFiles.map((file) => (
                    <option key={file.filename} value={file.filename}>
                      [{file.alliance_tag}] {file.date} - {file.filename}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            /* Date Range Mode */
            <div className="space-y-8 mb-8">
              {/* Alliance 1 Range Selection */}
              <div className="glass-card p-6 border border-blue-500/20">
                <h4 className="text-lg font-semibold text-blue-300 mb-4">
                  Alliance 1 Date Range
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Alliance
                    </label>
                    <select
                      value={selectedAlliance1}
                      onChange={(e) => {
                        setSelectedAlliance1(e.target.value);
                        setStartDate1("");
                        setEndDate1("");
                      }}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white
                               focus:outline-none focus:border-cyan-400 transition-colors duration-300"
                    >
                      <option value="">Select alliance...</option>
                      {availableAlliances.map((alliance) => (
                        <option key={alliance} value={alliance}>
                          {alliance}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Start Date
                    </label>
                    <select
                      value={startDate1}
                      onChange={(e) => setStartDate1(e.target.value)}
                      disabled={!selectedAlliance1}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white
                               focus:outline-none focus:border-cyan-400 transition-colors duration-300 disabled:opacity-50"
                    >
                      <option value="">Select start date...</option>
                      {selectedAlliance1 &&
                        getAvailableDatesForAlliance(selectedAlliance1).map(
                          (date) => (
                            <option key={date} value={date}>
                              {date}
                            </option>
                          )
                        )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">
                      End Date
                    </label>
                    <select
                      value={endDate1}
                      onChange={(e) => setEndDate1(e.target.value)}
                      disabled={!selectedAlliance1 || !startDate1}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white
                               focus:outline-none focus:border-cyan-400 transition-colors duration-300 disabled:opacity-50"
                    >
                      <option value="">Select end date...</option>
                      {selectedAlliance1 &&
                        getAvailableDatesForAlliance(selectedAlliance1)
                          .filter(
                            (date) => new Date(date) >= new Date(startDate1)
                          )
                          .map((date) => (
                            <option key={date} value={date}>
                              {date}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Alliance 2 Range Selection */}
              <div className="glass-card p-6 border border-orange-500/20">
                <h4 className="text-lg font-semibold text-orange-300 mb-4">
                  Alliance 2 Date Range
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Alliance
                    </label>
                    <select
                      value={selectedAlliance2}
                      onChange={(e) => {
                        setSelectedAlliance2(e.target.value);
                        setStartDate2("");
                        setEndDate2("");
                      }}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white
                               focus:outline-none focus:border-cyan-400 transition-colors duration-300"
                    >
                      <option value="">Select alliance...</option>
                      {availableAlliances.map((alliance) => (
                        <option key={alliance} value={alliance}>
                          {alliance}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Start Date
                    </label>
                    <select
                      value={startDate2}
                      onChange={(e) => setStartDate2(e.target.value)}
                      disabled={!selectedAlliance2}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white
                               focus:outline-none focus:border-cyan-400 transition-colors duration-300 disabled:opacity-50"
                    >
                      <option value="">Select start date...</option>
                      {selectedAlliance2 &&
                        getAvailableDatesForAlliance(selectedAlliance2).map(
                          (date) => (
                            <option key={date} value={date}>
                              {date}
                            </option>
                          )
                        )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">
                      End Date
                    </label>
                    <select
                      value={endDate2}
                      onChange={(e) => setEndDate2(e.target.value)}
                      disabled={!selectedAlliance2 || !startDate2}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white
                               focus:outline-none focus:border-cyan-400 transition-colors duration-300 disabled:opacity-50"
                    >
                      <option value="">Select end date...</option>
                      {selectedAlliance2 &&
                        getAvailableDatesForAlliance(selectedAlliance2)
                          .filter(
                            (date) => new Date(date) >= new Date(startDate2)
                          )
                          .map((date) => (
                            <option key={date} value={date}>
                              {date}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleCompare}
              disabled={
                loading ||
                (comparisonMode === "single" &&
                  (!selectedFile1 || !selectedFile2)) ||
                (comparisonMode === "range" &&
                  (!selectedAlliance1 ||
                    !selectedAlliance2 ||
                    !startDate1 ||
                    !endDate1 ||
                    !startDate2 ||
                    !endDate2))
              }
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg
                       hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-3
                       disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  {comparisonMode === "single"
                    ? "Analyzing Files..."
                    : "Processing Date Ranges..."}
                </>
              ) : (
                <>
                  <BarChart3 size={20} />
                  {comparisonMode === "single"
                    ? "Compare Files"
                    : "Compare Date Ranges"}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Comparison Results */}
        {((comparisonData.alliance1 && comparisonData.alliance2) ||
          (rangeComparisonData.alliance1 && rangeComparisonData.alliance2)) && (
          <>
            {/* Mode Indicator */}
            <div className="glass-card p-4 border border-cyan-500/20">
              <div className="flex items-center justify-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  {comparisonMode === "single" ? (
                    <BarChart3 className="text-cyan-400" size={20} />
                  ) : (
                    <Calendar className="text-cyan-400" size={20} />
                  )}
                </div>
                <span className="text-white font-semibold">
                  {comparisonMode === "single"
                    ? "Single File Comparison"
                    : "Date Range Comparison"}
                </span>
                {comparisonMode === "range" && (
                  <span className="text-cyan-300 text-sm">
                    (Includes growth metrics)
                  </span>
                )}
              </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-card p-8 border-2 border-blue-500/30 bg-blue-500/5">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Crown className="text-white" size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {comparisonData.alliance1?.alliance ||
                      rangeComparisonData.alliance1?.alliance}
                  </h2>
                  {comparisonMode === "single" ? (
                    <>
                      <p className="text-blue-300">
                        {comparisonData.alliance1?.date}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {comparisonData.alliance1?.fileName}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-blue-300">
                        {rangeComparisonData.alliance1?.startDate} →{" "}
                        {rangeComparisonData.alliance1?.endDate}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {rangeComparisonData.alliance1?.files.length} files
                        analyzed
                      </p>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-300">Top 250 Players</span>
                    <span className="text-white font-bold">
                      {comparisonData.alliance1?.top250Stats.playerCount ||
                        rangeComparisonData.alliance1?.aggregatedStats
                          .playerCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-300">Total Power</span>
                    <span className="text-white font-bold">
                      {formatLargeNumber(
                        comparisonData.alliance1?.top250Stats.totalPower ||
                          rangeComparisonData.alliance1?.aggregatedStats
                            .totalPower ||
                          0
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-300">Average Power</span>
                    <span className="text-white font-bold">
                      {formatNumber(
                        comparisonData.alliance1?.top250Stats.avgPower ||
                          rangeComparisonData.alliance1?.aggregatedStats
                            .avgPower ||
                          0
                      )}
                    </span>
                  </div>
                  {comparisonMode === "range" &&
                    rangeComparisonData.alliance1?.aggregatedStats
                      .growthMetrics && (
                      <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <span className="text-green-300">Power Growth</span>
                        <span className="text-green-400 font-bold">
                          +
                          {formatLargeNumber(
                            rangeComparisonData.alliance1.aggregatedStats
                              .growthMetrics.powerGrowth
                          )}
                        </span>
                      </div>
                    )}
                </div>
              </div>

              <div className="glass-card p-8 border-2 border-orange-500/30 bg-orange-500/5">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Crown className="text-white" size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {comparisonData.alliance2?.alliance ||
                      rangeComparisonData.alliance2?.alliance}
                  </h2>
                  {comparisonMode === "single" ? (
                    <>
                      <p className="text-orange-300">
                        {comparisonData.alliance2?.date}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {comparisonData.alliance2?.fileName}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-orange-300">
                        {rangeComparisonData.alliance2?.startDate} →{" "}
                        {rangeComparisonData.alliance2?.endDate}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {rangeComparisonData.alliance2?.files.length} files
                        analyzed
                      </p>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-300">Top 250 Players</span>
                    <span className="text-white font-bold">
                      {comparisonData.alliance2?.top250Stats.playerCount ||
                        rangeComparisonData.alliance2?.aggregatedStats
                          .playerCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-300">Total Power</span>
                    <span className="text-white font-bold">
                      {formatLargeNumber(
                        comparisonData.alliance2?.top210Stats.totalPower ||
                          rangeComparisonData.alliance2?.aggregatedStats
                            .totalPower ||
                          0
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-300">Average Power</span>
                    <span className="text-white font-bold">
                      {formatNumber(
                        comparisonData.alliance2?.top210Stats.avgPower ||
                          rangeComparisonData.alliance2?.aggregatedStats
                            .avgPower ||
                          0
                      )}
                    </span>
                  </div>
                  {comparisonMode === "range" &&
                    rangeComparisonData.alliance2?.aggregatedStats
                      .growthMetrics && (
                      <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <span className="text-green-300">Power Growth</span>
                        <span className="text-green-400 font-bold">
                          +
                          {formatLargeNumber(
                            rangeComparisonData.alliance2.aggregatedStats
                              .growthMetrics.powerGrowth
                          )}
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Detailed Comparisons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {renderStatComparison(
                "Total Power",
                comparisonData.alliance1?.top250Stats.totalPower ||
                  rangeComparisonData.alliance1?.aggregatedStats.totalPower ||
                  0,
                comparisonData.alliance2?.top250Stats.totalPower ||
                  rangeComparisonData.alliance2?.aggregatedStats.totalPower ||
                  0,
                Crown,
                "text-yellow-400"
              )}

              {renderStatComparison(
                "Total Units Killed",
                comparisonData.alliance1?.top250Stats.totalKills ||
                  rangeComparisonData.alliance1?.aggregatedStats.totalKills ||
                  0,
                comparisonData.alliance2?.top250Stats.totalKills ||
                  rangeComparisonData.alliance2?.aggregatedStats.totalKills ||
                  0,
                Sword,
                "text-red-400"
              )}

              {renderStatComparison(
                "Total Units Dead",
                comparisonData.alliance1?.top250Stats.totalDeads ||
                  rangeComparisonData.alliance1?.aggregatedStats.totalDeads ||
                  0,
                comparisonData.alliance2?.top250Stats.totalDeads ||
                  rangeComparisonData.alliance2?.aggregatedStats.totalDeads ||
                  0,
                Target,
                "text-orange-400"
              )}

              {renderStatComparison(
                "Total Units Healed",
                comparisonData.alliance1?.top250Stats.totalHealed ||
                  rangeComparisonData.alliance1?.aggregatedStats.totalHealed ||
                  0,
                comparisonData.alliance2?.top250Stats.totalHealed ||
                  rangeComparisonData.alliance2?.aggregatedStats.totalHealed ||
                  0,
                Heart,
                "text-green-400"
              )}

              {renderStatComparison(
                "Total Mana Spent",
                comparisonData.alliance1?.top250Stats.totalManaSpent ||
                  rangeComparisonData.alliance1?.aggregatedStats
                    .totalManaSpent ||
                  0,
                comparisonData.alliance2?.top250Stats.totalManaSpent ||
                  rangeComparisonData.alliance2?.aggregatedStats
                    .totalManaSpent ||
                  0,
                Zap,
                "text-purple-400"
              )}

              {renderStatComparison(
                "Total T5 Kills",
                comparisonData.alliance1?.top250Stats.totalT5Kills ||
                  rangeComparisonData.alliance1?.aggregatedStats.totalT5Kills ||
                  0,
                comparisonData.alliance2?.top250Stats.totalT5Kills ||
                  rangeComparisonData.alliance2?.aggregatedStats.totalT5Kills ||
                  0,
                Medal,
                "text-amber-400"
              )}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <BarChart3 className="text-purple-400" size={20} />
                  </div>
                  <h4 className="text-lg font-semibold text-white">
                    Metrics Comparison
                  </h4>
                </div>
                {renderComparisonChart()}
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-pink-500/20 rounded-lg">
                    <Star className="text-pink-400" size={20} />
                  </div>
                  <h4 className="text-lg font-semibold text-white">
                    Performance Radar
                  </h4>
                </div>
                {renderRadarChart()}
              </div>
            </div>

            {/* Average Comparisons */}
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Users className="text-indigo-400" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Average Player Performance
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {renderStatComparison(
                  "Average Power per Player",
                  comparisonData.alliance1?.top250Stats.avgPower ||
                    rangeComparisonData.alliance1?.aggregatedStats.avgPower ||
                    0,
                  comparisonData.alliance2?.top250Stats.avgPower ||
                    rangeComparisonData.alliance2?.aggregatedStats.avgPower ||
                    0,
                  Crown,
                  "text-yellow-400",
                  true
                )}

                {renderStatComparison(
                  "Average Kills per Player",
                  comparisonData.alliance1?.top250Stats.avgKills ||
                    rangeComparisonData.alliance1?.aggregatedStats.avgKills ||
                    0,
                  comparisonData.alliance2?.top250Stats.avgKills ||
                    rangeComparisonData.alliance2?.aggregatedStats.avgKills ||
                    0,
                  Sword,
                  "text-red-400",
                  true
                )}

                {renderStatComparison(
                  "Average Mana Spent per Player",
                  comparisonData.alliance1?.top250Stats.avgManaSpent ||
                    rangeComparisonData.alliance1?.aggregatedStats
                      .avgManaSpent ||
                    0,
                  comparisonData.alliance2?.top250Stats.avgManaSpent ||
                    rangeComparisonData.alliance2?.aggregatedStats
                      .avgManaSpent ||
                    0,
                  Zap,
                  "text-purple-400",
                  true
                )}

                {renderStatComparison(
                  "Average T5 Kills per Player",
                  comparisonData.alliance1?.top250Stats.avgT5Kills ||
                    rangeComparisonData.alliance1?.aggregatedStats.avgT5Kills ||
                    0,
                  comparisonData.alliance2?.top250Stats.avgT5Kills ||
                    rangeComparisonData.alliance2?.aggregatedStats.avgT5Kills ||
                    0,
                  Medal,
                  "text-amber-400",
                  true
                )}
              </div>
            </div>

            {/* Growth Metrics for Date Range Mode */}
            {comparisonMode === "range" &&
              rangeComparisonData.alliance1 &&
              rangeComparisonData.alliance2 && (
                <div className="glass-card p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <TrendingUp className="text-green-400" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      Growth Metrics Over Date Range
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {renderStatComparison(
                      "Power Growth",
                      rangeComparisonData.alliance1.aggregatedStats
                        .growthMetrics.powerGrowth,
                      rangeComparisonData.alliance2.aggregatedStats
                        .growthMetrics.powerGrowth,
                      TrendingUp,
                      "text-green-400"
                    )}

                    {renderStatComparison(
                      "Kills Growth",
                      rangeComparisonData.alliance1.aggregatedStats
                        .growthMetrics.killsGrowth,
                      rangeComparisonData.alliance2.aggregatedStats
                        .growthMetrics.killsGrowth,
                      Sword,
                      "text-red-400"
                    )}

                    {renderStatComparison(
                      "Mana Spent Growth",
                      rangeComparisonData.alliance1.aggregatedStats
                        .growthMetrics.manaSpentGrowth,
                      rangeComparisonData.alliance2.aggregatedStats
                        .growthMetrics.manaSpentGrowth,
                      Zap,
                      "text-purple-400"
                    )}

                    {renderStatComparison(
                      "T5 Kills Growth",
                      rangeComparisonData.alliance1.aggregatedStats
                        .growthMetrics.t5KillsGrowth,
                      rangeComparisonData.alliance2.aggregatedStats
                        .growthMetrics.t5KillsGrowth,
                      Medal,
                      "text-amber-400"
                    )}
                  </div>
                </div>
              )}
          </>
        )}

        {/* Empty State */}
        {!comparisonData.alliance1 &&
          !comparisonData.alliance2 &&
          !rangeComparisonData.alliance1 &&
          !rangeComparisonData.alliance2 &&
          !loading && (
            <div className="glass-card p-12 text-center">
              <div className="p-4 bg-cyan-500/20 rounded-2xl w-fit mx-auto mb-6">
                <Scale className="text-cyan-400" size={48} />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                Ready for Alliance Comparison
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Choose between single file comparison or date range analysis to
                compare alliance performance across multiple metrics.
              </p>
              <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Flame size={16} />
                  <span>Power Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy size={16} />
                  <span>Combat Metrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 size={16} />
                  <span>Visual Charts</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} />
                  <span>Growth Tracking</span>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
