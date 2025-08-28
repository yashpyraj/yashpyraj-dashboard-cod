import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types for database entities
export interface Alliance {
  id: string
  tag: string
  name: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export interface Player {
  id: string
  lord_id: string
  name: string
  alliance_id: string | null
  home_server: string | null
  town_center: number
  faction: string | null
  map_id: number | null
  in_power_rankings: boolean
  created_at: string
  updated_at: string
  alliance?: Alliance
}

export interface WeeklyStats {
  id: string
  player_id: string
  alliance_id: string | null
  date: string
  power: number
  highest_power: number
  legion_power: number
  tech_power: number
  building_power: number
  hero_power: number
  units_killed: number
  units_dead: number
  units_healed: number
  city_sieges: number
  defeats: number
  victories: number
  scouted: number
  gold: number
  wood: number
  ore: number
  mana: number
  gems: number
  resources_given: number
  resources_given_count: number
  helps_given: number
  gold_spent: number
  wood_spent: number
  stone_spent: number
  mana_spent: number
  gems_spent: number
  killcount_t5: number
  killcount_t4: number
  killcount_t3: number
  killcount_t2: number
  killcount_t1: number
  merits: number
  extra: Record<string, any>
  created_at: string
  player?: Player
  alliance?: Alliance
}

// Query functions

/**
 * Get all alliances
 */
export const getAlliances = async (): Promise<Alliance[]> => {
  const { data, error } = await supabase
    .from('alliances')
    .select('*')
    .order('tag')

  if (error) throw error
  return data || []
}

/**
 * Get all players for an alliance on a given date
 */
export const getAlliancePlayersForDate = async (
  allianceTag: string,
  date: string
): Promise<(WeeklyStats & { player: Player })[]> => {
  const { data, error } = await supabase
    .from('weekly_stats')
    .select(`
      *,
      player:players(*)
    `)
    .eq('date', date)
    .eq('alliance.tag', allianceTag)
    .order('power', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get player stats between two dates for delta calculation
 */
export const getPlayerStatsBetweenDates = async (
  lordId: string,
  startDate: string,
  endDate: string
): Promise<WeeklyStats[]> => {
  const { data, error } = await supabase
    .from('weekly_stats')
    .select(`
      *,
      player:players!inner(lord_id)
    `)
    .eq('player.lord_id', lordId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')

  if (error) throw error
  return data || []
}

/**
 * Get leaderboard for an alliance (top N by power)
 */
export const getAllianceLeaderboard = async (
  allianceTag: string,
  date: string,
  limit: number = 20
): Promise<(WeeklyStats & { player: Player })[]> => {
  const { data, error } = await supabase
    .from('weekly_stats')
    .select(`
      *,
      player:players(*),
      alliance:alliances!inner(tag)
    `)
    .eq('alliance.tag', allianceTag)
    .eq('date', date)
    .order('power', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

/**
 * Get global leaderboard (all alliances combined)
 */
export const getGlobalLeaderboard = async (
  date: string,
  limit: number = 50
): Promise<(WeeklyStats & { player: Player; alliance: Alliance })[]> => {
  const { data, error } = await supabase
    .from('weekly_stats')
    .select(`
      *,
      player:players(*),
      alliance:alliances(*)
    `)
    .eq('date', date)
    .order('power', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

/**
 * Get player's weekly progression
 */
export const getPlayerProgression = async (
  lordId: string,
  startDate?: string,
  endDate?: string
): Promise<(WeeklyStats & { player: Player; alliance: Alliance })[]> => {
  let query = supabase
    .from('weekly_stats')
    .select(`
      *,
      player:players!inner(*),
      alliance:alliances(*)
    `)
    .eq('player.lord_id', lordId)
    .order('date')

  if (startDate) {
    query = query.gte('date', startDate)
  }
  if (endDate) {
    query = query.lte('date', endDate)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Get alliance statistics for a date range
 */
export const getAllianceStats = async (
  allianceTag: string,
  startDate: string,
  endDate: string
) => {
  const { data, error } = await supabase
    .from('weekly_stats')
    .select(`
      date,
      power,
      units_killed,
      units_dead,
      mana_spent,
      alliance:alliances!inner(tag)
    `)
    .eq('alliance.tag', allianceTag)
    .gte('date', startDate)
    .lte('date', endDate)

  if (error) throw error

  // Aggregate by date
  const aggregated = data?.reduce((acc, row) => {
    const existing = acc.find(item => item.date === row.date)
    if (existing) {
      existing.total_power += row.power
      existing.total_kills += row.units_killed
      existing.total_deaths += row.units_dead
      existing.total_mana_spent += row.mana_spent
      existing.player_count += 1
    } else {
      acc.push({
        date: row.date,
        total_power: row.power,
        total_kills: row.units_killed,
        total_deaths: row.units_dead,
        total_mana_spent: row.mana_spent,
        player_count: 1
      })
    }
    return acc
  }, [] as any[])

  return aggregated || []
}

/**
 * Search players by name or lord_id
 */
export const searchPlayers = async (
  searchTerm: string,
  allianceTag?: string
): Promise<Player[]> => {
  let query = supabase
    .from('players')
    .select(`
      *,
      alliance:alliances(*)
    `)
    .or(`name.ilike.%${searchTerm}%,lord_id.ilike.%${searchTerm}%`)

  if (allianceTag) {
    query = query.eq('alliance.tag', allianceTag)
  }

  const { data, error } = await query.limit(20)

  if (error) throw error
  return data || []
}

/**
 * Get available dates for an alliance
 */
export const getAvailableDates = async (allianceTag?: string): Promise<string[]> => {
  let query = supabase
    .from('weekly_stats')
    .select('date')

  if (allianceTag) {
    query = query
      .select('date, alliance:alliances!inner(tag)')
      .eq('alliance.tag', allianceTag)
  }

  const { data, error } = await query

  if (error) throw error

  // Get unique dates and sort
  const uniqueDates = [...new Set(data?.map(row => row.date) || [])]
  return uniqueDates.sort()
}

/**
 * Import CSV data via Edge Function
 */
export const importCSVData = async (
  csvData: any[],
  filename: string,
  date: string
): Promise<any> => {
  const { data, error } = await supabase.functions.invoke('csv-import', {
    body: {
      csvData,
      filename,
      date
    }
  })

  if (error) throw error
  return data
}