/*
  # Seed Initial Alliances

  1. Alliance Data
    - Insert known alliances: BR, BTX, Echo, IR
    - Set proper names and descriptions
    - Handle conflicts with ON CONFLICT DO NOTHING

  2. Data Integrity
    - Ensures alliances exist before importing player data
    - Prevents duplicate alliance entries
*/

-- Insert initial alliances
INSERT INTO alliances (tag, name, description) VALUES
  ('BR', 'Blood Ravens', 'Elite warriors forged in battle'),
  ('BTX', 'Blue Thunder X', 'Strategic dominance through unity'),
  ('Echo', 'Echo Alliance', 'Rising force with unstoppable momentum'),
  ('IR', 'Iron Reign', 'Forged in steel, unbreakable will')
ON CONFLICT (tag) DO NOTHING;