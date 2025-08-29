/*
  # Alliance Analytics Database Schema

  1. New Tables
    - `alliances`
      - `id` (uuid, primary key)
      - `tag` (text, unique) - Alliance identifier like 'BR', 'BTX'
      - `name` (text, nullable) - Full alliance name
      - `description` (text, nullable) - Alliance description
      - `created_at`, `updated_at` (timestamptz)

    - `players`
      - `id` (uuid, primary key)
      - `lord_id` (text, unique) - Game's unique player identifier
      - `name` (text) - Player display name
      - `alliance_id` (uuid, foreign key) - Current alliance
      - `home_server`, `town_center`, `faction`, `map_id`, `in_power_rankings`
      - `created_at`, `updated_at` (timestamptz)

    - `weekly_stats`
      - `id` (uuid, primary key)
      - `player_id` (uuid, foreign key)
      - `alliance_id` (uuid, foreign key) - Alliance at time of recording
      - `date` (date) - Week date (YYYY-MM-DD)
      - All numeric stats (power, kills, resources, etc.)
      - `extra` (jsonb) - For future unknown metrics
      - `created_at` (timestamptz)
      - UNIQUE constraint: (player_id, date)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and service role
    - Secure access control for alliance data

  3. Performance
    - Optimized indexes for common queries
    - Foreign key relationships for data integrity
    - Efficient leaderboard and analytics queries
*/

-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create alliances table
CREATE TABLE IF NOT EXISTS alliances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag text UNIQUE NOT NULL,
  name text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lord_id text UNIQUE NOT NULL,
  name text NOT NULL,
  alliance_id uuid REFERENCES alliances(id) ON DELETE SET NULL,
  home_server text,
  town_center integer DEFAULT 0,
  faction text,
  map_id integer,
  in_power_rankings boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create weekly_stats table
CREATE TABLE IF NOT EXISTS weekly_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  alliance_id uuid REFERENCES alliances(id) ON DELETE SET NULL,
  date date NOT NULL,
  power bigint DEFAULT 0,
  highest_power bigint DEFAULT 0,
  legion_power bigint DEFAULT 0,
  tech_power bigint DEFAULT 0,
  building_power bigint DEFAULT 0,
  hero_power bigint DEFAULT 0,
  units_killed bigint DEFAULT 0,
  units_dead bigint DEFAULT 0,
  units_healed bigint DEFAULT 0,
  city_sieges integer DEFAULT 0,
  defeats integer DEFAULT 0,
  victories integer DEFAULT 0,
  scouted bigint DEFAULT 0,
  gold bigint DEFAULT 0,
  wood bigint DEFAULT 0,
  ore bigint DEFAULT 0,
  mana bigint DEFAULT 0,
  gems bigint DEFAULT 0,
  resources_given bigint DEFAULT 0,
  resources_given_count integer DEFAULT 0,
  helps_given integer DEFAULT 0,
  gold_spent bigint DEFAULT 0,
  wood_spent bigint DEFAULT 0,
  stone_spent bigint DEFAULT 0,
  mana_spent bigint DEFAULT 0,
  gems_spent bigint DEFAULT 0,
  killcount_t5 integer DEFAULT 0,
  killcount_t4 integer DEFAULT 0,
  killcount_t3 integer DEFAULT 0,
  killcount_t2 integer DEFAULT 0,
  killcount_t1 integer DEFAULT 0,
  merits bigint DEFAULT 0,
  extra jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  
  -- Ensure unique player stats per date
  UNIQUE(player_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_players_lord_id ON players(lord_id);
CREATE INDEX IF NOT EXISTS idx_players_alliance_id ON players(alliance_id);
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);

CREATE INDEX IF NOT EXISTS idx_weekly_stats_player_date ON weekly_stats(player_id, date);
CREATE INDEX IF NOT EXISTS idx_weekly_stats_alliance_date ON weekly_stats(alliance_id, date);
CREATE INDEX IF NOT EXISTS idx_weekly_stats_date ON weekly_stats(date);
CREATE INDEX IF NOT EXISTS idx_weekly_stats_power ON weekly_stats(power DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_stats_units_killed ON weekly_stats(units_killed DESC);

-- Create triggers for updated_at
CREATE TRIGGER update_alliances_updated_at
    BEFORE UPDATE ON alliances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE alliances ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Alliances are viewable by authenticated users"
  ON alliances
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage alliances"
  ON alliances
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Players are viewable by authenticated users"
  ON players
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage players"
  ON players
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Weekly stats are viewable by authenticated users"
  ON weekly_stats
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage weekly stats"
  ON weekly_stats
  FOR ALL
  TO service_role
  USING (true);