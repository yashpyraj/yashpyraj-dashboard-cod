import { supabase } from './supabaseQueries';
import { importCSVData } from './supabaseQueries';
import { parseCSVData } from './csvUtils';

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
    // Parse CSV content first
    const csvData = parseCSVData(csvContent);
    
    // Parse filename to get date
    const nameWithoutExt = filename.replace('.csv', '');
    const parts = nameWithoutExt.split('-');
    const allianceTag = parts[0];
    const date = parts.slice(1).join('-');
    
    // Use the Edge Function to import CSV data with proper permissions
    const result = await importCSVData(csvData, filename, date);
    
    return {
      success: result.success,
      processed: result.processed || 0,
      errors: result.errors || 0,
      errorDetails: result.errorDetails || [],
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
      alliance: filename.split('-')[0] || '',
      date: filename.replace('.csv', '').split('-').slice(1).join('-') || ''
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