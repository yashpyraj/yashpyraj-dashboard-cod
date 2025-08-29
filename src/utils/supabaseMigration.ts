import { supabase } from './supabaseQueries';
import { parseCSVData } from './csvUtils';

/**
 * Ensure all required alliances exist in the database
 */
const ensureAlliancesExist = async (): Promise<void> => {
  const requiredAlliances = [
    { tag: 'BR', name: 'Brotherhood' },
    { tag: 'BTX', name: 'Biotoxin' },
    { tag: 'Echo', name: 'Echo Alliance' },
    { tag: 'IR', name: 'Iron Ravens' }
  ];

  for (const alliance of requiredAlliances) {
    const { data, error } = await supabase
      .from('alliances')
      .select('id')
      .eq('tag', alliance.tag)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error checking alliance ${alliance.tag}: ${error.message}`);
    }

    if (!data) {
      // Alliance doesn't exist, create it
      const { error: insertError } = await supabase
        .from('alliances')
        .insert({
          tag: alliance.tag,
          name: alliance.name
        });

      if (insertError) {
        throw new Error(`Failed to create alliance ${alliance.tag}: ${insertError.message}`);
      }
      
      console.log(`✅ Created alliance: ${alliance.tag}`);
    }
  }
};

interface CSVImportResult {
  success: boolean;
  processed: number;
  errors: number;
  errorDetails: string[];
  alliance: string;
  date: string;
}

/**
 * Import CSV data directly into Supabase
 */
export const importCSVToSupabase = async (
  csvContent: string,
  filename: string
): Promise<CSVImportResult> => {
  try {
    // Parse filename to get alliance and date
    const nameWithoutExt = filename.replace('.csv', '');
    const parts = nameWithoutExt.split('-');
    
    let allianceTag: string;
    let date: string;
    
    if (parts.length >= 4) {
      // Alliance-YYYY-MM-DD format
      allianceTag = parts[0];
      date = parts.slice(1).join('-');
    } else {
      throw new Error(`Invalid filename format: ${filename}`);
    }

    // Parse CSV data
    const players = parseCSVData(csvContent);
    console.log(`Parsed ${players.length} players from ${filename}`);

    // Ensure alliances exist before proceeding
    await ensureAlliancesExist();

    // Get alliance ID
    const { data: alliance, error: allianceError } = await supabase
      .from('alliances')
      .select('id')
      .eq('tag', allianceTag)
      .maybeSingle();

    if (allianceError && allianceError.code !== 'PGRST116') {
      throw new Error(`Error fetching alliance ${allianceTag}: ${allianceError.message}`);
    }

    if (!alliance) {
      throw new Error(`Alliance not found after creation attempt: ${allianceTag}`);
    }

    let processedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each player
    for (const playerData of players) {
      try {
        // Upsert player record
        const { data: player, error: playerError } = await supabase
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
          .single();

        if (playerError) {
          throw new Error(`Player upsert failed: ${playerError.message}`);
        }

        // Insert weekly stats (will fail if duplicate due to unique constraint)
        const { error: statsError } = await supabase
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
          });

        if (statsError) {
          // If it's a duplicate, that's okay - skip it
          if (statsError.code === '23505') {
            console.log(`Skipping duplicate stats for player ${playerData.lord_id} on ${date}`);
          } else {
            throw new Error(`Stats insert failed: ${statsError.message}`);
          }
        }

        processedCount++;
      } catch (error) {
        errorCount++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push(`Player ${playerData.lord_id}: ${errorMsg}`);
        console.error(`Error processing player ${playerData.lord_id}:`, error);
      }
    }

    return {
      success: true,
      processed: processedCount,
      errors: errorCount,
      errorDetails: errors.slice(0, 10), // Return first 10 errors
      alliance: allianceTag,
      date: date
    };

  } catch (error) {
    console.error('CSV import error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      processed: 0,
      errors: 1,
      errorDetails: [errorMsg],
      alliance: '',
      date: ''
    };
  }
};

/**
 * Batch import all CSV files
 */
export const batchImportAllCSVs = async (): Promise<CSVImportResult[]> => {
  const csvFiles = [
    'BR-2025-06-28.csv',
    'BR-2025-07-27.csv',
    'BR-2025-08-03.csv',
    'BR-2025-08-11.csv',
    'BTX-2025-07-02.csv',
    'BTX-2025-07-28.csv',
    'BTX-2025-08-01.csv',
    'BTX-2025-08-08.csv',
    'BTX-2025-08-10.csv',
    'Echo-2025-07-25.csv',
    'Echo-2025-08-02.csv',
    'Echo-2025-08-08.csv',
    'Echo-2025-08-10.csv',
    'IR-2025-07-17.csv',
    'IR-2025-08-10.csv',
    'IR-2025-08-17.csv'
  ];

  const results: CSVImportResult[] = [];

  for (const filename of csvFiles) {
    try {
      console.log(`Importing ${filename}...`);
      const response = await fetch(`/data/${filename}`);
      
      if (!response.ok) {
        console.warn(`File not found: ${filename}`);
        continue;
      }

      const csvContent = await response.text();
      const result = await importCSVToSupabase(csvContent, filename);
      results.push(result);
      
      console.log(`✅ ${filename}: ${result.processed} players processed, ${result.errors} errors`);
      
      // Add delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Failed to import ${filename}:`, error);
      results.push({
        success: false,
        processed: 0,
        errors: 1,
        errorDetails: [error instanceof Error ? error.message : String(error)],
        alliance: '',
        date: ''
      });
    }
  }

  return results;
};