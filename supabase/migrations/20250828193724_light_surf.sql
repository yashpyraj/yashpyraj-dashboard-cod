/*
  # Seed Initial Alliance Data

  1. Initial Data
    - Insert known alliances from the CSV files
    - BR (Blood Ravens)
    - BTX (Blue Thunder X)  
    - Echo (Echo Alliance)
    - IR (Iron Reign)

  2. Notes
    - Uses ON CONFLICT to handle re-running migrations
    - Alliance names are descriptive but can be updated later
*/

-- Insert initial alliances
INSERT INTO alliances (tag, name, description) VALUES
  ('BR', 'Blood Ravens', 'Elite warriors forged in battle'),
  ('BTX', 'Blue Thunder X', 'Strategic dominance through unity'),
  ('Echo', 'Echo Alliance', 'Rising force with unstoppable momentum'),
  ('IR', 'Iron Reign', 'Forged in steel, unbreakable will')
ON CONFLICT (tag) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = now();