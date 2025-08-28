/*
  # Seed Initial Alliances

  1. Insert known alliances from your CSV data
    - BR (Blood Ravens)
    - BTX (Blue Thunder X)
    - Echo (Echo Alliance)
    - IR (Iron Reign)

  2. These match the alliance tags in your CSV files
*/

-- Insert initial alliances
INSERT INTO alliances (tag, name, description) VALUES
  ('BR', 'Blood Ravens', 'Elite warriors forged in battle'),
  ('BTX', 'Blue Thunder X', 'Strategic dominance through unity'),
  ('Echo', 'Echo Alliance', 'Rising force with unstoppable momentum'),
  ('IR', 'Iron Reign', 'Forged in steel, unbreakable will')
ON CONFLICT (tag) DO NOTHING;