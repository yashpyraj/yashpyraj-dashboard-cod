// Utility to automatically discover CSV files
export const discoverCSVFiles = async (): Promise<string[]> => {
  try {
    // Try to fetch a directory listing or manifest file
    // Since we can't directly list directory contents in a browser,
    // we'll try common filename patterns
    
    const possibleFiles: string[] = [];
    const alliances = ['BR', 'BTX'];
    const currentYear = new Date().getFullYear();
    
    // Generate possible filenames for the current year and previous year
    for (const alliance of alliances) {
      for (let year = currentYear - 1; year <= currentYear + 1; year++) {
        for (let month = 1; month <= 12; month++) {
          for (let day = 1; day <= 31; day++) {
            const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            possibleFiles.push(`${alliance}-${dateStr}.csv`);
          }
        }
      }
    }
    
    // Test which files actually exist
    const existingFiles: string[] = [];
    const batchSize = 10; // Test files in batches to avoid overwhelming the server
    
    for (let i = 0; i < possibleFiles.length; i += batchSize) {
      const batch = possibleFiles.slice(i, i + batchSize);
      const promises = batch.map(async (filename) => {
        try {
          const response = await fetch(`/data/${filename}`, { method: 'HEAD' });
          return response.ok ? filename : null;
        } catch {
          return null;
        }
      });
      
      const results = await Promise.all(promises);
      existingFiles.push(...results.filter(Boolean) as string[]);
    }
    
    return existingFiles.sort();
  } catch (error) {
    console.error('Error discovering CSV files:', error);
    // Fallback to known files
    return [
      'BR-2025-06-28.csv',
      'BR-2025-07-27.csv',
      'BTX-2025-07-02.csv',
      'BTX-2025-07-28.csv'
    ];
  }
};

// Alternative approach: Use a manifest file
export const loadFileManifest = async (): Promise<string[]> => {
  try {
    const response = await fetch('/data/manifest.json');
    if (response.ok) {
      const manifest = await response.json();
      return manifest.files || [];
    }
  } catch (error) {
    console.log('No manifest file found, using file discovery');
  }
  
  return discoverCSVFiles();
};