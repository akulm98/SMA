import React, { useState } from 'react';
import CSVUploader from './components/CSVUploader';
import StockTable from './components/StockTable';
import { Stock } from './types/Stock';
import { TrendingUp, Database } from 'lucide-react';

function App() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCSVData = async (csvData: any[]) => {
    setLoading(true);
    
    try {
      // Extract stock symbols from CSV data
      const symbols = csvData
        .map(row => row.symbol || row.Symbol || row.SYMBOL)
        .filter(symbol => symbol && typeof symbol === 'string')
        .map(symbol => symbol.trim().toUpperCase());

      if (symbols.length === 0) {
        throw new Error('No valid stock symbols found in CSV. Please ensure your CSV has a "symbol" column.');
      }

      // Fetch stock data for each symbol
      const stockPromises = symbols.map(async (symbol, index) => {
        try {
          const response = await fetch('/api/stock-quote', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ symbol }),
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch data for ${symbol}`);
          }

          const data = await response.json();
          
          return {
            id: index + 1,
            symbol,
            companyName: data.companyName || symbol,
            ltp: data.ltp || 0,
            open: data.open || 0,
            high: data.high || 0,
            low: data.low || 0,
            previousClose: data.previousClose || 0,
            change: data.change || 0,
            changePercent: data.changePercent || 0,
            volume: data.volume || 0,
            lastUpdated: new Date().toISOString(),
            ...csvData.find(row => 
              (row.symbol || row.Symbol || row.SYMBOL)?.trim().toUpperCase() === symbol
            )
          };
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
          return {
            id: index + 1,
            symbol,
            companyName: symbol,
            ltp: 0,
            open: 0,
            high: 0,
            low: 0,
            previousClose: 0,
            change: 0,
            changePercent: 0,
            volume: 0,
            lastUpdated: new Date().toISOString(),
            error: 'Failed to fetch data',
            ...csvData.find(row => 
              (row.symbol || row.Symbol || row.SYMBOL)?.trim().toUpperCase() === symbol
            )
          };
        }
      });

      const stockResults = await Promise.all(stockPromises);
      setStocks(stockResults);
    } catch (error) {
      console.error('Error processing CSV:', error);
      alert(error instanceof Error ? error.message : 'Error processing CSV file');
    } finally {
      setLoading(false);
    }
  };

  const refreshStockData = async () => {
    if (stocks.length === 0) return;
    
    setLoading(true);
    const symbols = stocks.map(stock => stock.symbol);
    
    try {
      const stockPromises = symbols.map(async (symbol, index) => {
        try {
          const response = await fetch('/api/stock-quote', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ symbol }),
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch data for ${symbol}`);
          }

          const data = await response.json();
          const existingStock = stocks.find(s => s.symbol === symbol);
          
          return {
            ...existingStock,
            ltp: data.ltp || 0,
            open: data.open || 0,
            high: data.high || 0,
            low: data.low || 0,
            previousClose: data.previousClose || 0,
            change: data.change || 0,
            changePercent: data.changePercent || 0,
            volume: data.volume || 0,
            lastUpdated: new Date().toISOString(),
          };
        } catch (error) {
          console.error(`Error refreshing data for ${symbol}:`, error);
          return stocks.find(s => s.symbol === symbol) || stocks[index];
        }
      });

      const stockResults = await Promise.all(stockPromises);
      setStocks(stockResults);
    } catch (error) {
      console.error('Error refreshing stock data:', error);
      alert('Error refreshing stock data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Stock Portfolio Manager</h1>
                <p className="text-sm text-gray-600">Upload your portfolio and track real-time prices</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Database className="h-4 w-4" />
              <span>{stocks.length} stocks loaded</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stocks.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Stock Portfolio</h2>
              <p className="text-lg text-gray-600">
                Upload a CSV file with your stock symbols to get started. We'll fetch real-time market data for each stock.
              </p>
            </div>
            <CSVUploader onDataLoaded={handleCSVData} loading={loading} />
            
            {/* CSV Format Guide */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">CSV Format Guide</h3>
                <button
                  onClick={() => {
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
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Template</span>
                </button>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Your CSV file should contain at least a <strong>symbol</strong> column with stock symbols. Additional columns will be preserved. Download the template below to get started quickly.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <code className="text-sm font-mono">
                    symbol,quantity,purchase_price,purchase_date<br/>
                    RELIANCE,100,2450.50,2024-01-15<br/>
                    TCS,50,3200.75,2024-01-20<br/>
                    INFY,75,1800.25,2024-02-01
                  </code>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Portfolio Overview</h2>
                <p className="text-gray-600 mt-1">Real-time stock prices and market data</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={refreshStockData}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <TrendingUp className={`h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
                  <span>{loading ? 'Refreshing...' : 'Refresh Prices'}</span>
                </button>
                <button
                  onClick={() => setStocks([])}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Upload New CSV
                </button>
              </div>
            </div>
            
            <StockTable stocks={stocks} loading={loading} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;