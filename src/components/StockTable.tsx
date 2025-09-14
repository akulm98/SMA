import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Stock } from '../types/Stock';

interface StockTableProps {
  stocks: Stock[];
  loading: boolean;
}

type SortField = keyof Stock;
type SortDirection = 'asc' | 'desc';

const StockTable: React.FC<StockTableProps> = ({ stocks, loading }) => {
  const [sortField, setSortField] = useState<SortField>('symbol');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedStocks = useMemo(() => {
    let filtered = stocks.filter(stock =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [stocks, sortField, sortDirection, searchTerm]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change: number, isPercent: boolean = false): string => {
    const formatted = isPercent 
      ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`
      : `${change >= 0 ? '+' : ''}${formatPrice(change)}`;
    return formatted;
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 10000000) return `${(volume / 10000000).toFixed(1)}Cr`;
    if (volume >= 100000) return `${(volume / 100000).toFixed(1)}L`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toLocaleString();
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

  const portfolioSummary = useMemo(() => {
    const totalGainers = stocks.filter(s => s.change > 0).length;
    const totalLosers = stocks.filter(s => s.change < 0).length;
    const totalUnchanged = stocks.filter(s => s.change === 0).length;
    
    return { totalGainers, totalLosers, totalUnchanged };
  }, [stocks]);

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Gainers</p>
              <p className="text-2xl font-bold text-green-900">{portfolioSummary.totalGainers}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Losers</p>
              <p className="text-2xl font-bold text-red-900">{portfolioSummary.totalLosers}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Stocks</p>
              <p className="text-2xl font-bold text-blue-900">{stocks.length}</p>
            </div>
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">{stocks.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="relative">
          <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by symbol or company name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[
                  { key: 'symbol', label: 'Symbol' },
                  { key: 'companyName', label: 'Company' },
                  { key: 'ltp', label: 'LTP' },
                  { key: 'change', label: 'Change' },
                  { key: 'changePercent', label: 'Change %' },
                  { key: 'open', label: 'Open' },
                  { key: 'high', label: 'High' },
                  { key: 'low', label: 'Low' },
                  { key: 'volume', label: 'Volume' },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort(key as SortField)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{label}</span>
                      <SortIcon field={key as SortField} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedStocks.map((stock, index) => (
                <tr
                  key={stock.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{stock.symbol}</span>
                      {stock.error && (
                        <AlertCircle className="h-4 w-4 text-red-500 ml-2" title={stock.error} />
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {stock.companyName}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">
                      {stock.ltp > 0 ? formatPrice(stock.ltp) : '-'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${
                      stock.change > 0 ? 'text-green-600' :
                      stock.change < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {stock.change !== 0 ? formatChange(stock.change) : '-'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      stock.changePercent > 0 ? 'bg-green-100 text-green-800' :
                      stock.changePercent < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {stock.changePercent !== 0 ? formatChange(stock.changePercent, true) : '0.00%'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {stock.open > 0 ? formatPrice(stock.open) : '-'}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {stock.high > 0 ? formatPrice(stock.high) : '-'}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {stock.low > 0 ? formatPrice(stock.low) : '-'}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {stock.volume > 0 ? formatVolume(stock.volume) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedStocks.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stocks found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms.' : 'Upload a CSV file to get started.'}
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Updating stock prices...</p>
          </div>
        )}
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date().toLocaleString('en-IN')}
      </div>
    </div>
  );
};

export default StockTable;