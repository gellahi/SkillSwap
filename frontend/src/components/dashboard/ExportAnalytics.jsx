import { useState } from 'react';
import { format } from 'date-fns';

const ExportAnalytics = ({ data, type = 'csv' }) => {
  const [exportFormat, setExportFormat] = useState(type);
  const [isExporting, setIsExporting] = useState(false);
  
  const generateCSV = (data) => {
    // Convert data to CSV format
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).join(',')).join('\n');
    return `${headers}\n${rows}`;
  };
  
  const generateJSON = (data) => {
    // Convert data to JSON format
    return JSON.stringify(data, null, 2);
  };
  
  const handleExport = () => {
    setIsExporting(true);
    
    try {
      // Generate file content based on format
      let content = '';
      let mimeType = '';
      let fileExtension = '';
      
      if (exportFormat === 'csv') {
        content = generateCSV(data);
        mimeType = 'text/csv';
        fileExtension = 'csv';
      } else if (exportFormat === 'json') {
        content = generateJSON(data);
        mimeType = 'application/json';
        fileExtension = 'json';
      }
      
      // Create a blob and download link
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Set download attributes
      link.href = url;
      link.download = `analytics_export_${format(new Date(), 'yyyy-MM-dd')}.${fileExtension}`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsExporting(false);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  };
  
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <label htmlFor="export-format" className="text-sm font-medium text-gray-700">
          Format:
        </label>
        <select
          id="export-format"
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value)}
          className="block w-24 pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
        >
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </select>
      </div>
      
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exporting...
          </>
        ) : (
          'Export Data'
        )}
      </button>
    </div>
  );
};

export default ExportAnalytics;
