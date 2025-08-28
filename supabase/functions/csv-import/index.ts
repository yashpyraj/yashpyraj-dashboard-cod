import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PlayerCSVRow {
  lord_id: string
  name: string
  alliance_id: string
  alliance_tag: string
  town_center: number
  home_server: string
  in_power_rankings: boolean
  power: number
  map_id: number
  units_killed: number
  faction: string
  merits: number
  highest_power: number
  legion_power: number
  tech_power: number
  building_power: number
  hero_power: number
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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { csvData, filename, date } = await req.json()
    
    if (!csvData || !filename || !date) {
      throw new Error('Missing required fields: csvData, filename, date')
    }

    // Parse alliance tag from filename (e.g., "BR-2025-08-11.csv" -> "BR")
    const allianceTag = filename.split('-')[0]
    
    // Get alliance ID
    const { data: alliance, error: allianceError } = await supabaseClient
      .from('alliances')
      .select('id')
      .eq('tag', allianceTag)
      .single()

    if (allianceError || !alliance) {
      throw new Error(`Alliance not found: ${allianceTag}`)
    }

    // Parse CSV data (assuming it's already parsed into JSON)
    const players: PlayerCSVRow[] = csvData

    let processedCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Process each player
    for (const playerData of players) {
      try {
        // Upsert player record
        const { data: player, error: playerError } = await supabaseClient
          .from('players')
          .upsert({
            lord_id: playerData.lord_id,
            name: playerData.name,
            alliance_id: alliance.id,
            home_server: playerData.home_server,
            town_center: playerData.town_center,
            faction: playerData.faction,
            map_id: playerData.map_id,
            in_power_rankings: playerData.in_power_rankings,
          }, {
            onConflict: 'lord_id',
            ignoreDuplicates: false
          })
          .select('id')
          .single()

        if (playerError) {
          throw new Error(`Player upsert failed: ${playerError.message}`)
        }

        // Insert weekly stats (will fail if duplicate due to unique constraint)
        const { error: statsError } = await supabaseClient
          .from('weekly_stats')
          .insert({
            player_id: player.id,
            alliance_id: alliance.id,
            date: date,
            power: playerData.power,
            highest_power: playerData.highest_power,
            legion_power: playerData.legion_power,
            tech_power: playerData.tech_power,
            building_power: playerData.building_power,
            hero_power: playerData.hero_power,
            units_killed: playerData.units_killed,
            units_dead: playerData.units_dead,
            units_healed: playerData.units_healed,
            city_sieges: playerData.city_sieges,
            defeats: playerData.defeats,
            victories: playerData.victories,
            scouted: playerData.scouted,
            gold: playerData.gold,
            wood: playerData.wood,
            ore: playerData.ore,
            mana: playerData.mana,
            gems: playerData.gems,
            resources_given: playerData.resources_given,
            resources_given_count: playerData.resources_given_count,
            helps_given: playerData.helps_given,
            gold_spent: playerData.gold_spent,
            wood_spent: playerData.wood_spent,
            stone_spent: playerData.stone_spent,
            mana_spent: playerData.mana_spent,
            gems_spent: playerData.gems_spent,
            killcount_t5: playerData.killcount_t5,
            killcount_t4: playerData.killcount_t4,
            killcount_t3: playerData.killcount_t3,
            killcount_t2: playerData.killcount_t2,
            killcount_t1: playerData.killcount_t1,
            merits: playerData.merits,
          })

        if (statsError) {
          // If it's a duplicate, that's okay - skip it
          if (statsError.code === '23505') {
            console.log(`Skipping duplicate stats for player ${playerData.lord_id} on ${date}`)
          } else {
            throw new Error(`Stats insert failed: ${statsError.message}`)
          }
        }

        processedCount++
      } catch (error) {
        errorCount++
        errors.push(`Player ${playerData.lord_id}: ${error.message}`)
        console.error(`Error processing player ${playerData.lord_id}:`, error)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${processedCount} players, ${errorCount} errors`,
        processed: processedCount,
        errors: errorCount,
        errorDetails: errors.slice(0, 10), // Return first 10 errors
        alliance: allianceTag,
        date: date
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('CSV import error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})