import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Shield,
  Users,
  TrendingUp,
  Zap,
  Crown,
  Sword,
  ChevronUp,
  Compass,
  Trophy,
  Scale,
  Menu,
  X,
  Calendar,
  Activity,
  Target,
  Flame,
  Star,
} from "lucide-react";
import { WeeklyData, AllianceFile } from "./types";
import { getAllianceFiles, loadCSVFile } from "./utils/csvUtils";
import { PlayerTable } from "./components/PlayerTable";
import { PlayerProfile } from "./components/PlayerProfile";
import { WelcomePage } from "./components/WelcomePage";
import { AllianceOverview } from "./components/AllianceOverview";
import { AllianceLeaderboard } from "./components/AllianceLeaderboard";
import { PlayerComparison } from "./components/PlayerComparison";
import { EventCalendar } from "./components/EventCalendar";
import { CreateEventModal } from "./components/CreateEventModal";
import { AllianceComparisonRoom } from "./components/AllianceComparisonRoom";
import { AllianceEvent, RSVPStatus } from "./types/events";
import {
  mockEvents,
  setupDiscordIntegration,
} from "./utils/discordIntegration";
import { MigrationPanel } from "./components/MigrationPanel";
import { loadWeeklyDataFromSupabase, getAllianceFilesFromSupabase } from "./utils/supabaseQueries";

type PageType =
  | "welcome"
  | "alliance"
  | "players"
  | "comparison"
  | "leaderboard"
  | "events"
  | "player-profile"
  | "alliance-comparison"
  | "migration";

function App() {
  const [availableFiles, setAvailableFiles] = useState<AllianceFile[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAlliance, setSelectedAlliance] = useState<string | null>(null);
  const [selectedPlayerProfile, setSelectedPlayerProfile] = useState<
    string | null
  >(null);
  const [currentPage, setCurrentPage] = useState<PageType>("welcome");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [comparisonPlayers, setComparisonPlayers] = useState<string[]>([]);
  const [events, setEvents] = useState<AllianceEvent[]>(mockEvents);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [useSupabase, setUseSupabase] = useState(false);

  // Discord integration setup
  const discordIntegration = setupDiscordIntegration("YOUR_WEBHOOK_URL_HERE");

  // Handle scroll events for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedAlliance && currentPage !== "welcome") {
      if (useSupabase) {
        loadAllianceDataFromSupabase(selectedAlliance);
      } else {
        loadAllianceData(selectedAlliance);
      }
    }
  }, [selectedAlliance, currentPage]);

  const loadAllianceDataFromSupabase = async (alliance: string) => {
    setLoading(true);
    try {
      console.log("Loading data from Supabase for alliance:", alliance);
      const data = await loadWeeklyDataFromSupabase(alliance);
      const files = await getAllianceFilesFromSupabase();
      
      console.log("Loaded from Supabase:", data.length, "weeks");
      setAvailableFiles(files);
      setWeeklyData(data);
    } catch (error) {
      console.error("Error loading from Supabase:", error);
      // Fallback to CSV loading
      await loadAllianceData(alliance);
    } finally {
      setLoading(false);
    }
  };
  const loadAllianceData = async (alliance: string) => {
    setLoading(true);
    try {
      console.log("Loading data for alliance:", alliance);
      const files = await getAllianceFiles();
      console.log("All available files:", files);
      setAvailableFiles(files);

      // Load only files for the selected alliance
      const allianceFiles = files.filter(
        (file) => file.alliance_tag === alliance
      );
      console.log("Files for alliance", alliance, ":", allianceFiles);
      const dataPromises = allianceFiles.map((file) =>
        loadCSVFile(file.filename)
      );
      const loadedData = await Promise.all(dataPromises);

      // Debug loaded data
      loadedData.forEach((weekData, index) => {
        console.log(`Week ${index + 1} (${weekData.date}):`, {
          alliance: weekData.alliance_tag,
          playerCount: weekData.players.length,
          samplePlayers: weekData.players
            .slice(0, 3)
            .map((p) => ({ lord_id: p.lord_id, name: p.name })),
        });
      });

      // Sort by date
      const sortedData = loadedData.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      console.log(
        "Final sorted data for",
        alliance,
        ":",
        sortedData.map((d) => ({ date: d.date, playerCount: d.players.length }))
      );
      setWeeklyData(sortedData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAllianceSelect = (alliance: string) => {
    setSelectedAlliance(alliance);
    setCurrentPage("alliance");
  };

  const handleComparisonRoomSelect = () => {
    setCurrentPage("alliance-comparison");
  };

  const handleMigrationSelect = () => {
    setCurrentPage("migration");
  };

  const handleMigrationComplete = () => {
    setUseSupabase(true);
    setCurrentPage("welcome");
  };

  const handleBackToWelcome = () => {
    setSelectedAlliance(null);
    setWeeklyData([]);
    setCurrentPage("welcome");
    setSelectedPlayerProfile(null);
    setMobileMenuOpen(false);
  };

  const handlePageChange = (page: PageType) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    scrollToTop();
  };

  const handlePlayerProfileSelect = (playerIdentifier: string) => {
    setSelectedPlayerProfile(playerIdentifier);
    setCurrentPage("player-profile");
  };

  const handlePlayerComparison = (player1Id: string, player2Id: string) => {
    setComparisonPlayers([player1Id, player2Id]);
    setCurrentPage("comparison");
  };

  const handleClosePlayerProfile = () => {
    setSelectedPlayerProfile(null);
    setCurrentPage("players");
  };

  const handleCloseComparison = () => {
    setComparisonPlayers([]);
    setCurrentPage("players");
  };

  const handleCreateEvent = (eventData: Partial<AllianceEvent>) => {
    const newEvent: AllianceEvent = {
      id: Date.now().toString(),
      title: eventData.title || "",
      description: eventData.description || "",
      type: eventData.type || "CUSTOM",
      startDate: eventData.startDate || new Date().toISOString(),
      endDate: eventData.endDate || new Date().toISOString(),
      location: eventData.location,
      maxParticipants: eventData.maxParticipants,
      rewards: eventData.rewards || [],
      ...eventData,
      createdBy: "current-user",
      createdAt: new Date().toISOString(),
      status: "UPCOMING",
      rsvps: [],
      results: [],
    } as AllianceEvent;

    setEvents((prev) => [...prev, newEvent]);
    setShowCreateEventModal(false);

    // Send Discord announcement if enabled
    try {
      discordIntegration.announceEvent(newEvent);
    } catch (error) {
      console.log("Discord announcement failed:", error);
    }
  };

  const handleRSVP = (eventId: string, status: RSVPStatus, notes?: string) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id === eventId) {
          const existingRSVP = event.rsvps.find(
            (rsvp) => rsvp.playerId === "current-user"
          );
          const newRSVP = {
            playerId: "current-user",
            playerName: "Current Player", // This would come from user context
            status,
            timestamp: new Date().toISOString(),
            notes,
          };

          if (existingRSVP) {
            return {
              ...event,
              rsvps: event.rsvps.map((rsvp) =>
                rsvp.playerId === "current-user" ? newRSVP : rsvp
              ),
            };
          } else {
            return {
              ...event,
              rsvps: [...event.rsvps, newRSVP],
            };
          }
        }
        return event;
      })
    );
  };

  const handleUpdateResults = (eventId: string, results: any[]) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id === eventId) {
          const updatedEvent = {
            ...event,
            results,
            status: "COMPLETED" as const,
          };

          // Send Discord results announcement
          const discord = setupDiscordIntegration("YOUR_WEBHOOK_URL_HERE");
          discord.announceResults(updatedEvent, results);

          // Send MVP announcements
          results.forEach((result) => {
            if (
              result.achievement.includes("MVP") ||
              result.achievement.includes("Leader")
            ) {
              discord.announceMVP(
                result.playerName,
                result.achievement,
                event.title
              );
            }
          });

          return updatedEvent;
        }
        return event;
      })
    );
  };

  const hasData = weeklyData.length > 0;

  // Show welcome page if no alliance is selected
  if (
    currentPage === "welcome" ||
    (!selectedAlliance && currentPage !== "alliance-comparison" && currentPage !== "migration")
  ) {
    return (
      <WelcomePage
        onAllianceSelect={handleAllianceSelect}
        onComparisonRoomSelect={handleComparisonRoomSelect}
        onMigrationSelect={handleMigrationSelect}
      />
    );
  }

  // Show player profile page
  if (currentPage === "player-profile" && selectedPlayerProfile) {
    return (
      <PlayerProfile
        playerIdentifier={selectedPlayerProfile}
        weeklyData={weeklyData}
        onClose={handleClosePlayerProfile}
      />
    );
  }

  // Show player comparison page
  if (currentPage === "comparison" && comparisonPlayers.length === 2) {
    return (
      <PlayerComparison
        player1Id={comparisonPlayers[0]}
        player2Id={comparisonPlayers[1]}
        weeklyData={weeklyData}
        onClose={handleCloseComparison}
      />
    );
  }

  // Show alliance comparison room
  if (currentPage === "alliance-comparison") {
    return <AllianceComparisonRoom onClose={handleBackToWelcome} />;
  }

  // Show migration panel
  if (currentPage === "migration") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8">
            <button
              onClick={handleBackToWelcome}
              className="px-4 py-2 bg-gray-800/50 text-gray-300 border border-gray-600 rounded-lg
                       hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-300 text-sm"
            >
              ← Back to Home
            </button>
          </div>
          <MigrationPanel onMigrationComplete={handleMigrationComplete} />
        </div>
      </div>
    );
  }

  const navigationItems = [
    {
      id: "alliance" as PageType,
      label: "Alliance Info",
      icon: Shield,
      color: "text-purple-400",
    },
    {
      id: "players" as PageType,
      label: "Players",
      icon: Users,
      color: "text-green-400",
    },
    {
      id: "comparison" as PageType,
      label: "Comparison Room",
      icon: Scale,
      color: "text-blue-400",
    },
    {
      id: "leaderboard" as PageType,
      label: "Leaderboard",
      icon: Trophy,
      color: "text-yellow-400",
    },
    {
      id: "events" as PageType,
      label: "Events",
      icon: Calendar,
      color: "text-pink-400",
    },
    {
      id: "migration" as PageType,
      label: "Migration",
      icon: Database,
      color: "text-cyan-400",
    },
  ];

  const renderPageContent = () => {
    if (loading) {
      return (
        <div className="glass-card p-12 text-center">
          <img
            src="/Frame 1.gif"
            alt="Loading animation"
            className="w-24 h-24 mx-auto mb-4 rounded-lg"
          />
          <h3 className="text-xl font-semibold text-white mb-2">
            Loading {selectedAlliance} Data
          </h3>
          <p className="text-gray-400">
            Loading alliance data from CSV files...
          </p>
        </div>
      );
    }

    if (!hasData) {
      return (
        <div className="glass-card p-12 text-center">
          <img
            src="/Frame 1.gif"
            alt="Dashboard animation"
            className="w-32 h-32 mx-auto mb-6 rounded-lg opacity-75"
          />
          <h3 className="text-xl font-semibold text-white mb-2">
            No Data Available
          </h3>
          <p className="text-gray-400">
            Unable to load CSV data files for {selectedAlliance}. Please check
            if the data files are available.
          </p>
        </div>
      );
    }

    switch (currentPage) {
      case "alliance":
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
                <Compass className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Alliance Command Center
                </h2>
                <p className="text-gray-300">
                  Strategic overview and performance metrics
                </p>
              </div>
            </div>

            <AllianceOverview
              weeklyData={weeklyData}
              selectedAlliance={selectedAlliance!}
            />

            <AllianceLeaderboard weeklyData={weeklyData} />
          </div>
        );

      case "players":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
                <Activity className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Player Intelligence Hub
                </h2>
                <p className="text-gray-300">
                  Individual performance tracking and detailed analytics
                </p>
              </div>
            </div>

            <PlayerTable
              weeklyData={weeklyData}
              selectedAlliance={selectedAlliance}
              onPlayerProfileSelect={handlePlayerProfileSelect}
              onPlayerComparison={handlePlayerComparison}
            />
          </div>
        );

      case "comparison":
        return (
          <div className="glass-card p-12 text-center">
            <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl w-fit mx-auto mb-6">
              <Target className="text-white" size={48} />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              Comparison Room
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Select exactly 2 players from the Players page to start a detailed
              comparison analysis.
            </p>
            <button
              onClick={() => handlePageChange("players")}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg
                       hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              <Activity size={20} />
              Go to Players
            </button>
          </div>
        );

      case "events":
        return (
          <div className="space-y-8">
            <EventCalendar
              events={events}
              currentPlayerId="current-user"
              onCreateEvent={handleCreateEvent}
              onRSVP={handleRSVP}
              onUpdateResults={handleUpdateResults}
            />
            <CreateEventModal
              isOpen={showCreateEventModal}
              onClose={() => setShowCreateEventModal(false)}
              onSubmit={handleCreateEvent}
            />
          </div>
        );

      case "leaderboard":
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl">
                <Flame className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Global Leaderboard
                </h2>
                <p className="text-gray-300">
                  Competitive rankings and achievements
                </p>
              </div>
            </div>

            <AllianceLeaderboard weeklyData={weeklyData} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Navigation Header */}
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-gray-900/90 border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <BarChart3 className="text-white" size={24} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">
                  {selectedAlliance} Alliance
                </h1>
                <p className="text-xs text-gray-400">Command Dashboard</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    currentPage === item.id
                      ? `bg-gradient-to-r from-gray-800 to-gray-700 ${item.color} border border-current shadow-lg`
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile Menu Button & Back Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToWelcome}
                className="px-4 py-2 bg-gray-800/50 text-gray-300 border border-gray-600 rounded-lg
                         hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-300 text-sm"
              >
                ← Home
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors duration-300"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-700/50 py-4">
              <div className="grid grid-cols-2 gap-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handlePageChange(item.id)}
                    className={`flex items-center gap-2 px-3 py-3 rounded-lg font-medium transition-all duration-300 ${
                      currentPage === item.id
                        ? `bg-gradient-to-r from-gray-800 to-gray-700 ${item.color} border border-current`
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent"
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="animate-fadeIn">{renderPageContent()}</div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-blue-500 to-purple-600 
                   text-white rounded-full shadow-2xl hover:shadow-blue-500/25 
                   hover:scale-110 transition-all duration-300 z-50 group"
          aria-label="Scroll to top"
        >
          <ChevronUp size={24} className="group-hover:animate-bounce" />
        </button>
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        onSubmit={handleCreateEvent}
      />
    </div>
  );
}

export default App;
