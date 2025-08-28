# CSV to Supabase Migration Guide

## Overview

This guide walks you through migrating your CSV-based player data system to Supabase Postgres.

## Database Schema

### Tables Structure

1. **alliances** - Alliance information
   - `id` (uuid, primary key)
   - `tag` (text, unique) - Alliance tag like 'BR', 'BTX'
   - `name` (text, nullable) - Full alliance name
   - `description` (text, nullable)
   - `created_at`, `updated_at` (timestamptz)

2. **players** - Player master data
   - `id` (uuid, primary key)
   - `lord_id` (text, unique) - Game's unique player identifier
   - `name` (text) - Player display name
   - `alliance_id` (uuid, foreign key) - Current alliance
   - `home_server`, `town_center`, `faction`, `map_id`, `in_power_rankings`
   - `created_at`, `updated_at` (timestamptz)

3. **weekly_stats** - Time-series player statistics
   - `id` (uuid, primary key)
   - `player_id` (uuid, foreign key)
   - `alliance_id` (uuid, foreign key) - Alliance at time of recording
   - `date` (date) - Week date (YYYY-MM-DD)
   - All numeric stats (power, kills, resources, etc.)
   - `extra` (jsonb) - For future unknown metrics
   - `created_at` (timestamptz)
   - **UNIQUE constraint**: (player_id, date)

### Key Features

- **Referential Integrity**: Foreign keys ensure data consistency
- **Performance Indexes**: Optimized for common queries
- **Row Level Security**: Secure access control
- **Extensibility**: JSONB field for future metrics

## Migration Steps

### 1. Set Up Supabase Project

1. Create a new Supabase project
2. Get your project URL and service role key
3. Add environment variables:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### 2. Run Database Migrations

Execute the migration files in order:

```bash
# Using Supabase CLI
supabase db reset
supabase migration up

# Or manually in SQL Editor
# 1. Run create_alliance_schema.sql
# 2. Run seed_initial_alliances.sql
```

### 3. Deploy Edge Function

```bash
supabase functions deploy csv-import
```

### 4. Import Existing CSV Data

#### Option A: Using the Edge Function

```javascript
import { importCSVData } from './src/utils/supabaseQueries'

// Parse your CSV file
const csvData = parseCSVFile(csvContent)
const filename = 'BR-2025-08-11.csv'
const date = '2025-08-11'

const result = await importCSVData(csvData, filename, date)
console.log(result)
```

#### Option B: Batch Import Script

```javascript
// Example batch import for all your CSV files
const files = [
  'BR-2025-06-28.csv',
  'BR-2025-07-27.csv',
  'BTX-2025-07-02.csv',
  // ... more files
]

for (const filename of files) {
  const csvContent = await fetch(`/data/${filename}`).then(r => r.text())
  const csvData = parseCSVData(csvContent)
  const date = filename.match(/(\d{4}-\d{2}-\d{2})/)[1]
  
  await importCSVData(csvData, filename, date)
  console.log(`Imported ${filename}`)
}
```

## Query Examples

### Get Alliance Leaderboard

```sql
SELECT 
  p.name,
  p.lord_id,
  ws.power,
  ws.units_killed,
  ws.merits
FROM weekly_stats ws
JOIN players p ON ws.player_id = p.id
JOIN alliances a ON ws.alliance_id = a.id
WHERE a.tag = 'BR' 
  AND ws.date = '2025-08-11'
ORDER BY ws.power DESC
LIMIT 20;
```

### Calculate Player Deltas

```sql
WITH current_stats AS (
  SELECT * FROM weekly_stats 
  WHERE player_id = (SELECT id FROM players WHERE lord_id = '12345')
    AND date = '2025-08-11'
),
previous_stats AS (
  SELECT * FROM weekly_stats 
  WHERE player_id = (SELECT id FROM players WHERE lord_id = '12345')
    AND date = '2025-08-03'
)
SELECT 
  c.power - p.power as power_delta,
  c.units_killed - p.units_killed as kills_delta,
  c.merits - p.merits as merits_delta
FROM current_stats c, previous_stats p;
```

### Global Leaderboard

```sql
SELECT 
  p.name,
  a.tag as alliance,
  ws.power,
  ws.units_killed
FROM weekly_stats ws
JOIN players p ON ws.player_id = p.id
JOIN alliances a ON ws.alliance_id = a.id
WHERE ws.date = '2025-08-11'
ORDER BY ws.power DESC
LIMIT 50;
```

### Alliance Growth Over Time

```sql
SELECT 
  ws.date,
  COUNT(*) as player_count,
  SUM(ws.power) as total_power,
  SUM(ws.units_killed) as total_kills,
  AVG(ws.power) as avg_power
FROM weekly_stats ws
JOIN alliances a ON ws.alliance_id = a.id
WHERE a.tag = 'BR'
GROUP BY ws.date, a.tag
ORDER BY ws.date;
```

## Performance Considerations

### Indexing Strategy

The schema includes optimized indexes for:
- Player lookups by `lord_id`
- Date-based queries
- Alliance-specific queries
- Leaderboard queries (power, kills)

### Query Optimization Tips

1. **Use date ranges**: Always filter by date for large datasets
2. **Limit results**: Use `LIMIT` for leaderboards
3. **Index usage**: Ensure queries use existing indexes
4. **Batch operations**: Use transactions for bulk inserts

## Data Validation

### Constraints

- **Unique player per date**: Prevents duplicate weekly stats
- **Foreign key integrity**: Ensures referential consistency
- **Not null constraints**: Critical fields cannot be empty

### Data Quality Checks

```sql
-- Check for missing players
SELECT DISTINCT lord_id FROM weekly_stats ws
LEFT JOIN players p ON ws.player_id = p.id
WHERE p.id IS NULL;

-- Check for orphaned stats
SELECT COUNT(*) FROM weekly_stats ws
LEFT JOIN players p ON ws.player_id = p.id
WHERE p.id IS NULL;

-- Validate date ranges
SELECT MIN(date), MAX(date), COUNT(DISTINCT date)
FROM weekly_stats;
```

## Backup and Recovery

### Regular Backups

```bash
# Backup specific tables
pg_dump -h your-host -U postgres -t alliances -t players -t weekly_stats your_db > backup.sql

# Restore
psql -h your-host -U postgres your_db < backup.sql
```

### CSV Export (Fallback)

```sql
-- Export alliance data back to CSV format
COPY (
  SELECT 
    p.lord_id,
    p.name,
    a.tag as alliance_tag,
    ws.*
  FROM weekly_stats ws
  JOIN players p ON ws.player_id = p.id
  JOIN alliances a ON ws.alliance_id = a.id
  WHERE ws.date = '2025-08-11' AND a.tag = 'BR'
) TO '/tmp/BR-2025-08-11-export.csv' WITH CSV HEADER;
```

## Monitoring and Maintenance

### Key Metrics to Monitor

- Table sizes and growth rates
- Query performance
- Index usage
- Data freshness (latest import dates)

### Maintenance Tasks

- Regular `VACUUM` and `ANALYZE`
- Monitor slow queries
- Archive old data if needed
- Update statistics regularly

## Troubleshooting

### Common Issues

1. **Duplicate key errors**: Check for existing data before import
2. **Foreign key violations**: Ensure alliances exist before importing players
3. **Performance issues**: Check query plans and index usage
4. **Data type mismatches**: Validate CSV data types

### Debug Queries

```sql
-- Check data distribution
SELECT alliance_id, COUNT(*) 
FROM weekly_stats 
GROUP BY alliance_id;

-- Find missing dates
SELECT generate_series('2025-06-01'::date, '2025-08-31'::date, '1 week'::interval)::date
EXCEPT
SELECT DISTINCT date FROM weekly_stats
ORDER BY 1;
```

This migration provides a robust, scalable foundation for your alliance analytics platform with improved query performance, data integrity, and extensibility.