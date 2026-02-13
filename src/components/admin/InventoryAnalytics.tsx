"use client";

import { useState, useEffect } from 'react';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  BarChart3, 
  PieChart, 
  Activity,
  Download,
  Filter,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface StockAnalytics {
  totalProducts: number;
  totalStock: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  categories: Array<{
    name: string;
    count: number;
    totalStock: number;
    lowStock: number;
    outOfStock: number;
  }>;
  recentMovements: Array<{
    productId: number;
    productName: string;
    previousStock: number;
    newStock: number;
    change: number;
    changeType: 'increase' | 'decrease';
    timestamp: string;
    reason?: string;
  }>;
  stockValue: {
    totalValue: number;
    lowStockValue: number;
    outOfStockValue: number;
  };
}

export default function InventoryAnalytics() {
  const [analytics, setAnalytics] = useState<StockAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, selectedCategory]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics/inventory?range=${dateRange}&category=${selectedCategory}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/inventory/export?range=${dateRange}&category=${selectedCategory}`);
      if (!response.ok) throw new Error('Failed to export report');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Unable to load analytics data</p>
      </div>
    );
  }

  const stockHealthPercentage = ((analytics.totalStock - analytics.lowStockProducts - analytics.outOfStockProducts) / analytics.totalStock) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Analytics</h2>
          <p className="text-gray-600 mt-1">Monitor stock levels and inventory performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.totalProducts.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stock</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.totalStock.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{analytics.lowStockProducts.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{analytics.outOfStockProducts.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Stock Health */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Health Overview</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Stock Health</span>
              <span className="text-sm text-gray-600">{stockHealthPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stockHealthPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {analytics.totalStock - analytics.lowStockProducts - analytics.outOfStockProducts}
              </div>
              <div className="text-sm text-green-700">Healthy Stock</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{analytics.lowStockProducts}</div>
              <div className="text-sm text-orange-700">Low Stock</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{analytics.outOfStockProducts}</div>
              <div className="text-sm text-red-700">Out of Stock</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
        <div className="space-y-3">
          {analytics.categories.map((category) => {
            const categoryHealth = ((category.totalStock - category.lowStock - category.outOfStock) / category.totalStock) * 100;
            return (
              <div key={category.name} className="border-b border-gray-100 pb-3 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-gray-900">{category.name}</span>
                    <span className="text-sm text-gray-500 ml-2">({category.count} products)</span>
                  </div>
                  <span className="text-sm text-gray-600">{categoryHealth.toFixed(1)}% healthy</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${categoryHealth}%` }}
                  ></div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>Total: {category.totalStock}</span>
                  <span className="text-orange-600">Low: {category.lowStock}</span>
                  <span className="text-red-600">Out: {category.outOfStock}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Stock Movements */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Stock Movements</h3>
        <div className="space-y-3">
          {analytics.recentMovements.slice(0, 10).map((movement, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  movement.changeType === 'increase' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {movement.changeType === 'increase' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{movement.productName}</div>
                  <div className="text-sm text-gray-600">
                    {movement.previousStock} → {movement.newStock} ({movement.change > 0 ? '+' : ''}{movement.change})
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {new Date(movement.timestamp).toLocaleDateString()}
                </div>
                {movement.reason && (
                  <div className="text-xs text-gray-500">{movement.reason}</div>
                )}
              </div>
            </div>
          ))}
          {analytics.recentMovements.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No recent stock movements
            </div>
          )}
        </div>
      </div>

      {/* Stock Value Analysis */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Value Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              ${analytics.stockValue.totalValue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Inventory Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              ${analytics.stockValue.lowStockValue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Low Stock Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              ${analytics.stockValue.outOfStockValue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Lost Sales Value</div>
          </div>
        </div>
      </div>
    </div>
  );
}
