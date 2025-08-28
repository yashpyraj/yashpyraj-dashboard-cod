import Papa from "papaparse";
import { PlayerData, WeeklyData, AllianceFile } from "../types";

export const parseCSVData = (csvText: string): PlayerData[] => {
  const result = Papa.parse<PlayerData>(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  console.log("Parsed CSV data sample:", result.data.slice(0, 3));
  return result.data.map((row) => ({
    lord_id: String(row.lord_id || "").trim(),
    name: String(row.name || ""),
    alliance_id: String(row.alliance_id || "").trim(),
    alliance_tag: String(row.alliance_tag || ""),
    town_center: Number(row.town_center) || 0,
    home_server: String(row.home_server || ""),
    in_power_rankings: Boolean(row.in_power_rankings),
    power: Number(row.power) || 0,
    map_id: Number(row.map_id) || 0,
    units_killed: Number(row.units_killed) || 0,
    faction: String(row.faction || ""),
    merits: Number(row.merits) || 0,
    highest_power: Number(row.highest_power) || 0,
    legion_power: Number(row.legion_power) || 0,
    tech_power: Number(row.tech_power) || 0,
    building_power: Number(row.building_power) || 0,
    hero_power: Number(row.hero_power) || 0,
    units_dead: Number(row.units_dead) || 0,
    units_healed: Number(row.units_healed) || 0,
    city_sieges: Number(row.city_sieges) || 0,
    defeats: Number(row.defeats) || 0,
    victories: Number(row.victories) || 0,
    scouted: Number(row.scouted) || 0,
    gold: Number(row.gold) || 0,
    wood: Number(row.wood) || 0,
    ore: Number(row.ore) || 0,
    mana: Number(row.mana) || 0,
    gems: Number(row.gems) || 0,
    resources_given: Number(row.resources_given) || 0,
    resources_given_count: Number(row.resources_given_count) || 0,
    helps_given: Number(row.helps_given) || 0,
    gold_spent: Number(row.gold_spent) || 0,
    wood_spent: Number(row.wood_spent) || 0,
    stone_spent: Number(row.stone_spent) || 0,
    mana_spent: Number(row.mana_spent) || 0,
    gems_spent: Number(row.gems_spent) || 0,
    killcount_t5: Number(row.killcount_t5) || 0,
    killcount_t4: Number(row.killcount_t4) || 0,
    killcount_t3: Number(row.killcount_t3) || 0,
    killcount_t2: Number(row.killcount_t2) || 0,
    killcount_t1: Number(row.killcount_t1) || 0,
  }));
};

export const loadCSVFile = async (filename: string): Promise<WeeklyData> => {
  try {
    console.log("Loading CSV file:", filename);
    const response = await fetch(`/data/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }
    const csvText = await response.text();
    const players = parseCSVData(csvText);
    console.log(`Loaded ${filename}: ${players.length} players`);

    // Parse filename: Alliance-YYYY-MM-DD.csv or YYYY-MM-DD.csv
    const { alliance, date } = parseFilename(filename);
    console.log(
      `Parsed filename ${filename}: alliance=${alliance}, date=${date}`
    );

    return { date, alliance_tag: alliance, players };
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    throw error;
  }
};

export const parseFilename = (
  filename: string
): { alliance: string; date: string } => {
  const nameWithoutExt = filename.replace(".csv", "");

  // Check if filename contains alliance prefix (Alliance-YYYY-MM-DD)
  const parts = nameWithoutExt.split("-");
  if (parts.length >= 4) {
    // Alliance-YYYY-MM-DD format
    const alliance = parts[0];
    const date = parts.slice(1).join("-");
    return { alliance, date };
  } else {
    // YYYY-MM-DD format (legacy, assume mixed alliance)
    return { alliance: "Mixed", date: nameWithoutExt };
  }
};

export const getAllianceFiles = async (): Promise<AllianceFile[]> => {
  try {
    // Try to load from manifest.json first
    const response = await fetch("/data/manifest.json");
    if (response.ok) {
      const manifest = await response.json();
      const filenames = manifest.files || [];

      return filenames.map((filename: string) => {
        const { alliance, date } = parseFilename(filename);
        return { filename, alliance_tag: alliance, date };
      });
    }
  } catch (error) {
    console.log("Could not load manifest.json, using fallback file list");
  }

  // This function now returns a promise to fetch available files
  // We'll need to modify the calling code to handle this
  const filenames = [
    "BR-2025-06-28.csv",
    "BR-2025-07-27.csv",
    "BR-2025-08-03.csv",
    "BR-2025-08-11.csv",
    "BTX-2025-07-02.csv",
    "BTX-2025-07-28.csv",
    "BTX-2025-08-01.csv",
    "BTX-2025-08-08.csv",
    "BTX-2025-08-10.csv",
    "Echo-2025-07-25.csv",
    "Echo-2025-08-02.csv",
    "Echo-2025-08-08.csv",
    "Echo-2025-08-10.csv",
    "IR-2025-07-17.csv",
    "IR-2025-08-10.csv",
  ];

  return filenames.map((filename) => {
    const { alliance, date } = parseFilename(filename);
    return { filename, alliance_tag: alliance, date };
  });
};

export const calculatePlayerDeltas = (
  current: PlayerData,
  previous: PlayerData
) => {
  return {
    powerDelta: current.power - previous.power,
    unitsKilledDelta: current.units_killed - previous.units_killed,
    unitsDeadDelta: current.units_dead - previous.units_dead,
    goldSpentDelta: current.gold_spent - previous.gold_spent,
  };
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + "B";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toLocaleString();
};

export const formatNumberWithCommas = (num: number): string => {
  return num.toLocaleString("en-US");
};

export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(3) + "B";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(3) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + "K";
  }
  return num.toLocaleString("en-US");
};

export const formatPowerNumber = (num: number): string => {
  if (num >= 1000000000) {
    const billions = (num / 1000000000).toFixed(3);
    return `${billions}B`;
  }
  if (num >= 1000000) {
    const millions = (num / 1000000).toFixed(2);
    return `${millions}M`;
  }
  if (num >= 1000) {
    const thousands = (num / 1000).toFixed(1);
    return `${thousands}K`;
  }
  return num.toLocaleString("en-US");
};

export const formatDelta = (delta: number): string => {
  const formatted = formatNumber(Math.abs(delta));
  return delta >= 0 ? `+${formatted}` : `-${formatted}`;
};
