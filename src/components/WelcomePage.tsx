import React from "react";
import { useState } from "react";
import {
  Shield,
  Users,
  TrendingUp,
  Zap,
  Crown,
  Sword,
  Target,
  BarChart3,
  Activity,
  ChevronRight,
  Star,
  Trophy,
  Rocket,
  Database,
  Globe,
  Sparkles,
  Lock,
  Unlock,
  X,
  Scale,
  Calendar,
} from "lucide-react";

interface WelcomePageProps {
  onAllianceSelect: (alliance: string) => void;
  onComparisonRoomSelect?: () => void;
  onMigrationSelect?: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onAllianceSelect,
  onComparisonRoomSelect,
  onMigrationSelect,
}) => {
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedAlliance, setSelectedAlliance] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const alliancePins = {
    BR: "2000",
    BTX: "1997",
    Echo: "1234",
    IR: "1776",
    COMPARE: "2008",
  };

  const alliances = [
    {
      tag: "BR",
      name: "Blood Ravens",
      color: "from-red-500 to-red-700",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      textColor: "text-red-300",
      description: "Elite warriors forged in battle",
      stats: { members: "150+", power: "2.1B+", kills: "890K+" },
    },
    {
      tag: "BTX",
      name: "Blue Thunder X",
      color: "from-blue-500 to-blue-700",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-300",
      description: "Strategic dominance through unity",
      stats: { members: "140+", power: "1.8B+", kills: "750K+" },
    },
    {
      tag: "Echo",
      name: "Echo Alliance",
      color: "from-green-500 to-green-700",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      textColor: "text-green-300",
      description: "Rising force with unstoppable momentum",
      stats: { members: "120+", power: "1.5B+", kills: "650K+" },
    },
    {
      tag: "IR",
      name: "Iron Reign",
      color: "from-gray-500 to-gray-700",
      bgColor: "bg-gray-500/10",
      borderColor: "border-gray-500/30",
      textColor: "text-gray-300",
      description: "Forged in steel, unbreakable will",
      stats: { members: "100+", power: "1.2B+", kills: "500K+" },
    },
  ];

  const handleAllianceClick = (allianceTag: string) => {
    setSelectedAlliance(allianceTag);
    setShowPinModal(true);
    setPinInput("");
    setPinError("");
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAlliance) return;

    const correctPin =
      alliancePins[selectedAlliance as keyof typeof alliancePins];

    if (pinInput === correctPin) {
      setShowPinModal(false);
      if (selectedAlliance === "COMPARE") {
        onComparisonRoomSelect?.();
      } else {
        onAllianceSelect(selectedAlliance);
      }
    } else {
      setPinError("Incorrect PIN. Please try again.");
      setPinInput("");
    }
  };

  const closePinModal = () => {
    setShowPinModal(false);
    setSelectedAlliance(null);
    setPinInput("");
    setPinError("");
  };

  const features = [
    {
      icon: Activity,
      title: "Player Analytics",
      description: "Track individual player progress and performance metrics",
    },
    {
      icon: Rocket,
      title: "Growth Tracking",
      description:
        "Monitor power growth, kills, and resource management over time",
    },
    {
      icon: Database,
      title: "Detailed Reports",
      description: "Generate comprehensive progress reports with PDF export",
    },
    {
      icon: Globe,
      title: "Real-time Data",
      description: "Access up-to-date statistics and comparative analysis",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center pt-16 pb-8">
          <div className="flex justify-center mb-6">
            <img
              src="/Frame 1.gif"
              alt="Yammy Dashboard"
              className="w-32 h-32 rounded-2xl shadow-2xl border-4 border-purple-500/30"
            />
          </div>
          <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Yammy Dashboard
          </h1>
          <p className="text-xl text-gray-300 mb-2 flex items-center justify-center gap-2">
            <Sparkles className="text-purple-400" size={20} />
            Season SOS5 Alliance Analytics Platform
            <Sparkles className="text-purple-400" size={20} />
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Advanced player tracking, performance analytics, and comprehensive
            reporting for alliance management
          </p>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto px-6 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card p-6 text-center group hover:scale-105 transition-all duration-300"
              >
                <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl w-fit mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                  <feature.icon className="text-white" size={24} />
                </div>
                <h3 className="text-white font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alliance Selection */}
        <div className="max-w-4xl mx-auto px-6 pb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Shield className="text-purple-400" size={36} />
              Select Your Alliance
            </h2>
            <p className="text-gray-300 text-lg">
              Choose an alliance to access detailed analytics and player
              insights
            </p>
            <p className="text-gray-400 text-sm mt-2 flex items-center justify-center gap-2">
              <Lock className="text-yellow-400" size={16} />
              PIN required for secure access
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {alliances.map((alliance) => (
              <div
                key={alliance.tag}
                onClick={() => handleAllianceClick(alliance.tag)}
                className={`glass-card p-8 cursor-pointer group hover:scale-105 transition-all duration-300 
                          ${alliance.bgColor} ${alliance.borderColor} border-2 hover:shadow-2xl hover:shadow-purple-500/20`}
              >
                <div className="text-center mb-6">
                  <div
                    className={`inline-flex p-4 bg-gradient-to-r ${alliance.color} rounded-2xl mb-4 group-hover:shadow-lg transition-all duration-300`}
                  >
                    <Shield className="text-white" size={32} />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    [{alliance.tag}]
                  </h3>
                </div>

                {/* <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between py-2 px-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-gray-300">Members</span>
                    </div>
                    <span className="text-white font-semibold">
                      {alliance.stats.members}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Crown size={16} className="text-gray-400" />
                      <span className="text-gray-300">Total Power</span>
                    </div>
                    <span className="text-white font-semibold">
                      {alliance.stats.power}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Sword size={16} className="text-gray-400" />
                      <span className="text-gray-300">Total Kills</span>
                    </div>
                    <span className="text-white font-semibold">
                      {alliance.stats.kills}
                    </span>
                  </div>
                </div> */}

                <div className="flex items-center justify-center gap-2 text-white font-semibold group-hover:gap-4 transition-all duration-300">
                  <Lock className="text-yellow-400" size={20} />
                  <span>Enter Dashboard</span>
                  <ChevronRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alliance Comparison Room */}
        <div className="max-w-4xl mx-auto px-6 pb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Scale className="text-cyan-400" size={32} />
              Alliance Comparison Room
            </h2>
            <p className="text-gray-300 text-lg">
              Compare top 250 players between different alliances
            </p>
            <p className="text-gray-400 text-sm mt-2 flex items-center justify-center gap-2">
              <Lock className="text-cyan-400" size={16} />
              Special access required
            </p>
          </div>

          <div className="flex justify-center">
            <div
              onClick={() => handleAllianceClick("COMPARE")}
              className="glass-card p-8 cursor-pointer group hover:scale-105 transition-all duration-300 
                        bg-cyan-500/10 border-cyan-500/30 border-2 hover:shadow-2xl hover:shadow-cyan-500/20 max-w-md"
            >
              <div className="text-center mb-6">
                <div className="inline-flex p-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl mb-4 group-hover:shadow-lg transition-all duration-300">
                  <Scale className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Comparison Room
                </h3>
                <p className="text-cyan-300 text-sm font-medium">
                  Advanced alliance analytics
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center py-2 px-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-gray-400" />
                    <span className="text-gray-300">Top 250 Analysis</span>
                  </div>
                </div>
                <div className="flex items-center justify-center py-2 px-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-300">Multi-Week Comparison</span>
                  </div>
                </div>
                <div className="flex items-center justify-center py-2 px-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-gray-400" />
                    <span className="text-gray-300">Detailed Metrics</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-white font-semibold group-hover:gap-4 transition-all duration-300">
                <Lock className="text-cyan-400" size={20} />
                <span>Enter Comparison Room</span>
                <ChevronRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Migration Panel */}
        <div className="max-w-4xl mx-auto px-6 pb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Database className="text-green-400" size={32} />
              Database Migration
            </h2>
            <p className="text-gray-300 text-lg">
              Migrate your CSV data to Supabase for enhanced performance
            </p>
            <p className="text-gray-400 text-sm mt-2 flex items-center justify-center gap-2">
              <Lock className="text-green-400" size={16} />
              One-time setup process
            </p>
          </div>

          <div className="flex justify-center">
            <div
              onClick={onMigrationSelect}
              className="glass-card p-8 cursor-pointer group hover:scale-105 transition-all duration-300 
                        bg-green-500/10 border-green-500/30 border-2 hover:shadow-2xl hover:shadow-green-500/20 max-w-md"
            >
              <div className="text-center mb-6">
                <div className="inline-flex p-4 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl mb-4 group-hover:shadow-lg transition-all duration-300">
                  <Database className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Start Migration
                </h3>
                <p className="text-green-300 text-sm font-medium">
                  Import CSV data to Supabase
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center py-2 px-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Upload size={16} className="text-gray-400" />
                    <span className="text-gray-300">Batch CSV Import</span>
                  </div>
                </div>
                <div className="flex items-center justify-center py-2 px-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-gray-400" />
                    <span className="text-gray-300">Enhanced Performance</span>
                  </div>
                </div>
                <div className="flex items-center justify-center py-2 px-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-gray-400" />
                    <span className="text-gray-300">Data Integrity</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-white font-semibold group-hover:gap-4 transition-all duration-300">
                <Database className="text-green-400" size={20} />
                <span>Start Migration</span>
                <ChevronRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* PIN Modal */}
        {showPinModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
              className={`glass-card max-w-md w-full p-8 border-2 ${
                selectedAlliance === "COMPARE"
                  ? "border-cyan-500/30 bg-cyan-500/5"
                  : "border-yellow-500/30 bg-yellow-500/5"
              }`}
            >
              <div className="text-center mb-6">
                <div
                  className={`p-4 rounded-2xl w-fit mx-auto mb-4 ${
                    selectedAlliance === "COMPARE"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                      : "bg-gradient-to-r from-yellow-500 to-orange-500"
                  }`}
                >
                  {selectedAlliance === "COMPARE" ? (
                    <Scale className="text-white" size={32} />
                  ) : (
                    <Lock className="text-white" size={32} />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {selectedAlliance === "COMPARE"
                    ? "Access Comparison Room"
                    : `Access [${selectedAlliance}] Alliance`}
                </h3>
                <p className="text-gray-300">
                  {selectedAlliance === "COMPARE"
                    ? "Enter the PIN to access the Alliance Comparison Room"
                    : `Enter the PIN to access ${
                        alliances.find((a) => a.tag === selectedAlliance)?.name
                      } dashboard`}
                </p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Alliance PIN
                  </label>
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setPinError("");
                    }}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white text-center text-xl font-mono
                           focus:outline-none focus:border-yellow-400 transition-colors duration-300"
                    placeholder="Enter PIN"
                    maxLength={4}
                    autoFocus
                  />
                  {pinError && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                      <X size={16} />
                      {pinError}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={closePinModal}
                    className="flex-1 px-6 py-3 text-gray-300 border border-gray-600 rounded-lg
                           hover:bg-gray-800/50 hover:border-gray-500 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 px-6 py-3 text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                      selectedAlliance === "COMPARE"
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                        : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    }`}
                  >
                    {selectedAlliance === "COMPARE" ? (
                      <>
                        <Scale size={20} />
                        Enter Room
                      </>
                    ) : (
                      <>
                        <Unlock size={20} />
                        Access
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
                <p className="text-gray-400 text-sm text-center">
                  🔒 Secure access ensures only authorized members can view
                  alliance data
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Footer */}
        <div className="text-center pb-8">
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
            <Star size={16} />
            <span className="text-sm">Powered by Yammy</span>
            <Star size={16} />
          </div>
          <p className="text-gray-500 text-xs">
            Real-time data processing • Comprehensive reporting • Strategic
            insights
          </p>
        </div>
      </div>
    </div>
  );
};
