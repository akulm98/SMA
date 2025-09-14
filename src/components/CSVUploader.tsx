import React, { useRef, useState } from 'react';
import { Upload, FileText, AlertCircle, Download } from 'lucide-react';

interface CSVUploaderProps {
  onDataLoaded: (data: any[]) => void;
  loading: boolean;
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ onDataLoaded, loading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadTemplate = () => {
    const templateData = [
      ['symbol', 'quantity', 'purchase_price', 'purchase_date'],
      ['RELIANCE', '100', '2450.50', '2024-01-15'],
      ['TCS', '50', '3200.75', '2024-01-20'],
      ['INFY', '75', '1800.25', '2024-02-01'],
      ['HDFCBANK', '25', '1650.00', '2024-02-10'],
      ['ICICIBANK', '60', '950.80', '2024-02-15']
    ];

    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'stock_portfolio_template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header row and one data row.');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }
    }

    return data;
  };

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        onDataLoaded(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error parsing CSV file');
      }
    };

    reader.onerror = () => {
      setError('Error reading file');
    };

    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
          ${dragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-white'
          }
          ${loading ? 'pointer-events-none opacity-60' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="hidden"
          disabled={loading}
        />

        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-lg font-medium text-gray-700 mt-4">Processing your portfolio...</p>
              <p className="text-sm text-gray-500">Fetching real-time stock prices</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="bg-blue-100 p-4 rounded-full">
                  {dragOver ? (
                    <Upload className="h-8 w-8 text-blue-600 animate-bounce" />
                  ) : (
                    <FileText className="h-8 w-8 text-blue-600" />
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {dragOver ? 'Drop your CSV file here' : 'Upload your stock portfolio'}
                </h3>
                <p className="text-gray-600">
                  Drag and drop your CSV file here, or click to browse
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <p><strong>Supported format:</strong> CSV files with stock symbols</p>
                <p><strong>Required column:</strong> symbol (case insensitive)</p>
                <p><strong>Max file size:</strong> 10MB</p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default CSVUploader;