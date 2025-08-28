import React, { useState } from 'react';
import { Database, Upload, CheckCircle, AlertCircle, Loader, Download } from 'lucide-react';
import { batchImportAllCSVs, importCSVToSupabase } from '../utils/supabaseMigration';

interface MigrationPanelProps {
  onMigrationComplete: () => void;
}

export const MigrationPanel: React.FC<MigrationPanelProps> = ({ onMigrationComplete }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleBatchImport = async () => {
    setIsImporting(true);
    setImportResults([]);
    setShowResults(true);

    try {
      const results = await batchImportAllCSVs();
      setImportResults(results);
      
      const totalProcessed = results.reduce((sum, r) => sum + r.processed, 0);
      const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);
      
      console.log(`Migration complete: ${totalProcessed} players processed, ${totalErrors} errors`);
      
      if (totalProcessed > 0) {
        onMigrationComplete();
      }
    } catch (error) {
      console.error('Batch import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleSingleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    try {
      const csvContent = await file.text();
      const result = await importCSVToSupabase(csvContent, file.name);
      setImportResults([result]);
      setShowResults(true);
      
      if (result.success && result.processed > 0) {
        onMigrationComplete();
      }
    } catch (error) {
      console.error('Single file import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const totalProcessed = importResults.reduce((sum, r) => sum + r.processed, 0);
  const totalErrors = importResults.reduce((sum, r) => sum + r.errors, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 border-2 border-blue-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Database className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Database Migration</h2>
            <p className="text-gray-300">Import your CSV data into Supabase</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Batch Import */}
          <button
            onClick={handleBatchImport}
            disabled={isImporting}
            className="p-6 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg
                     hover:from-green-600 hover:to-blue-700 transition-all duration-300 
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
          >
            {isImporting ? (
              <Loader className="animate-spin" size={24} />
            ) : (
              <Upload size={24} />
            )}
            <div className="text-left">
              <div className="font-semibold">Import All CSV Files</div>
              <div className="text-sm opacity-90">Batch import from /data folder</div>
            </div>
          </button>

          {/* Single File Import */}
          <label className="p-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg
                           hover:from-purple-600 hover:to-pink-700 transition-all duration-300 
                           cursor-pointer flex items-center gap-3">
            <Download size={24} />
            <div className="text-left">
              <div className="font-semibold">Import Single File</div>
              <div className="text-sm opacity-90">Upload a CSV file</div>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleSingleFileImport}
              disabled={isImporting}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Import Progress */}
      {isImporting && (
        <div className="glass-card p-6 border border-blue-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Loader className="animate-spin text-blue-400" size={20} />
            <h3 className="text-lg font-semibold text-white">Importing Data...</h3>
          </div>
          <div className="text-gray-300">
            Processing CSV files and inserting into Supabase database...
          </div>
        </div>
      )}

      {/* Results */}
      {showResults && importResults.length > 0 && (
        <div className="glass-card p-6 border border-gray-600/20">
          <div className="flex items-center gap-3 mb-6">
            {totalErrors === 0 ? (
              <CheckCircle className="text-green-400" size={24} />
            ) : (
              <AlertCircle className="text-yellow-400" size={24} />
            )}
            <div>
              <h3 className="text-lg font-semibold text-white">Import Results</h3>
              <p className="text-gray-300">
                {totalProcessed} players processed, {totalErrors} errors
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {importResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success && result.errors === 0
                    ? 'bg-green-500/10 border-green-500/30'
                    : result.success && result.errors > 0
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-white">
                    {result.alliance} - {result.date}
                  </div>
                  <div className="flex items-center gap-2">
                    {result.success && result.errors === 0 ? (
                      <CheckCircle className="text-green-400" size={16} />
                    ) : result.success && result.errors > 0 ? (
                      <AlertCircle className="text-yellow-400" size={16} />
                    ) : (
                      <AlertCircle className="text-red-400" size={16} />
                    )}
                    <span className="text-sm text-gray-300">
                      {result.processed} processed, {result.errors} errors
                    </span>
                  </div>
                </div>
                
                {result.errorDetails && result.errorDetails.length > 0 && (
                  <div className="text-sm text-gray-400 mt-2">
                    <div className="font-medium mb-1">Errors:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {result.errorDetails.slice(0, 3).map((error: string, i: number) => (
                        <li key={i} className="text-xs">{error}</li>
                      ))}
                      {result.errorDetails.length > 3 && (
                        <li className="text-xs">... and {result.errorDetails.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalProcessed > 0 && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-green-300">
                <CheckCircle size={20} />
                <span className="font-medium">
                  Migration successful! Your data is now in Supabase.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};