export interface PlayerData {
  name: string;
  alliance_tag: string;
  power: number;
  units_killed: number;
  units_dead: number;
  gold_spent: number;
  killcount_t5: number;
  killcount_t4: number;
  killcount_t3: number;
  killcount_t2: number;
  killcount_t1: number;
  merits: number;
  lord_id: string;
  alliance_id: string;
  town_center: number;
  home_server: string;
  in_power_rankings: boolean;
  map_id: number;
  faction: string;
  highest_power: number;
  legion_power: number;
  tech_power: number;
  building_power: number;
  hero_power: number;
  units_healed: number;
  city_sieges: number;
  defeats: number;
  victories: number;
  scouted: number;
  gold: number;
  wood: number;
  ore: number;
  mana: number;
  gems: number;
  resources_given: number;
  resources_given_count: number;
  helps_given: number;
  wood_spent: number;
  stone_spent: number;
  mana_spent: number;
  gems_spent: number;
}

export interface WeeklyData {
  date: string;
  alliance_tag: string;
  players: PlayerData[];
}

export interface PlayerComparison extends PlayerData {
  powerDelta?: number;
  unitsKilledDelta?: number;
  unitsDeadDelta?: number;
  goldSpentDelta?: number;
}

export interface AllianceFile {
  filename: string;
  alliance_tag: string;
  date: string;
}
