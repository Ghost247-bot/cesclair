"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  AlertTriangle, 
  Package, 
  TrendingUp, 
  TrendingDown,
  Undo2,
  Save,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  category: string | null;
  imageUrl: string | null;
  stock: number;
  sku: string | null;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  createdAt: string;
  updatedAt: string;
}

interface BulkUpdateItem {
  productId: number;
  productName: string;
  currentStock: number;
  newStock: number;
  sku: string | null;
  category: string | null;
}

interface StockHistory {
  productId: number;
  productName: string;
  previousStock: number;
  newStock: number;
  updatedBy: string;
  updatedAt: string;
  reason?: string;
}

export default function BulkStockManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [bulkUpdates, setBulkUpdates] = useState<BulkUpdateItem[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price' | 'updated'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkUpdatePanel, setShowBulkUpdatePanel] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [bulkStockValue, setBulkStockValue] = useState('');
  const [updateReason, setUpdateReason] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<string>('');

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'stock':
          comparison = a.stock - b.stock;
          break;
        case 'price':
          comparison = parseFloat(a.price) - parseFloat(b.price);
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Selection management
  const toggleProductSelection = (productId: number) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleAllProducts = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const clearSelection = () => {
    setSelectedProducts(new Set());
    setBulkUpdates([]);
  };

  // Stock update management
  const updateProductStock = (productId: number, newStock: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingUpdateIndex = bulkUpdates.findIndex(u => u.productId === productId);
    const updateItem: BulkUpdateItem = {
      productId,
      productName: product.name,
      currentStock: product.stock,
      newStock,
      sku: product.sku,
      category: product.category
    };

    if (existingUpdateIndex >= 0) {
      const newUpdates = [...bulkUpdates];
      newUpdates[existingUpdateIndex] = updateItem;
      setBulkUpdates(newUpdates);
    } else {
      setBulkUpdates([...bulkUpdates, updateItem]);
    }
  };

  const applyBulkStock = () => {
    selectedProducts.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if (product && bulkStockValue) {
        updateProductStock(productId, parseInt(bulkStockValue));
      }
    });
  };

  // Execute bulk updates
  const executeBulkUpdates = async () => {
    if (bulkUpdates.length === 0) {
      toast.error('No stock updates to apply');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch('/api/admin/products/bulk-stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: bulkUpdates,
          reason: updateReason
        })
      });

      if (!response.ok) throw new Error('Failed to update stock');

      const result = await response.json();
      
      // Update local products
      setProducts(prev => prev.map(product => {
        const update = bulkUpdates.find(u => u.productId === product.id);
        return update ? { ...product, stock: update.newStock, updatedAt: new Date().toISOString() } : product;
      }));

      // Add to history
      const historyItems: StockHistory[] = bulkUpdates.map(update => ({
        productId: update.productId,
        productName: update.productName,
        previousStock: update.currentStock,
        newStock: update.newStock,
        updatedBy: 'Admin',
        updatedAt: new Date().toISOString(),
        reason: updateReason
      }));
      setStockHistory(prev => [...historyItems, ...prev]);

      toast.success(`Successfully updated stock for ${bulkUpdates.length} products`);
      setBulkUpdates([]);
      setSelectedProducts(new Set());
      setBulkStockValue('');
      setUpdateReason('');
      setShowBulkUpdatePanel(false);

    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    } finally {
      setUpdating(false);
    }
  };

  // Undo last update
  const undoLastUpdate = async () => {
    if (stockHistory.length === 0) return;

    const lastUpdate = stockHistory[0];
    try {
      const response = await fetch('/api/admin/products/stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: lastUpdate.productId,
          stock: lastUpdate.previousStock,
          reason: 'Undo previous update'
        })
      });

      if (!response.ok) throw new Error('Failed to undo update');

      setProducts(prev => prev.map(product => 
        product.id === lastUpdate.productId 
          ? { ...product, stock: lastUpdate.previousStock, updatedAt: new Date().toISOString() }
          : product
      ));

      setStockHistory(prev => prev.slice(1));
      toast.success('Successfully undone last update');

    } catch (error) {
      console.error('Error undoing update:', error);
      toast.error('Failed to undo update');
    }
  };

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  // Stock status indicators
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'text-red-600', bg: 'bg-red-50', label: 'Out of Stock', icon: X };
    if (stock < 5) return { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Low Stock', icon: AlertTriangle };
    if (stock < 20) return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Limited', icon: Package };
    return { color: 'text-green-600', bg: 'bg-green-50', label: 'In Stock', icon: Package };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin h-8 w-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bulk Stock Management</h2>
          <p className="text-gray-600 mt-1">
            Manage inventory levels for multiple products simultaneously
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stockHistory.length > 0 && (
            <button
              onClick={undoLastUpdate}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Undo2 className="w-4 h-4" />
              Undo Last
            </button>
          )}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Package className="w-4 h-4" />
            History ({stockHistory.length})
          </button>
          <button
            onClick={fetchProducts}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedProducts.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
              </span>
              {bulkUpdates.length > 0 && (
                <span className="text-blue-700">
                  ({bulkUpdates.length} pending update{bulkUpdates.length !== 1 ? 's' : ''})
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBulkUpdatePanel(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Bulk Update Stock
              </button>
              <button
                onClick={clearSelection}
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products by name, SKU, or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="stock">Sort by Stock</option>
              <option value="price">Sort by Price</option>
              <option value="updated">Sort by Updated</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">All Status</option>
                  <option value="out-of-stock">Out of Stock</option>
                  <option value="low-stock">Low Stock (1-4)</option>
                  <option value="limited">Limited (5-19)</option>
                  <option value="in-stock">In Stock (20+)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 p-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                    onChange={toggleAllProducts}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="text-left p-4 font-medium text-gray-900">Product</th>
                <th className="text-left p-4 font-medium text-gray-900">SKU</th>
                <th className="text-left p-4 font-medium text-gray-900">Category</th>
                <th className="text-left p-4 font-medium text-gray-900">Price</th>
                <th className="text-left p-4 font-medium text-gray-900">Current Stock</th>
                <th className="text-left p-4 font-medium text-gray-900">New Stock</th>
                <th className="text-left p-4 font-medium text-gray-900">Status</th>
                <th className="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                const bulkUpdate = bulkUpdates.find(u => u.productId === product.id);
                const isSelected = selectedProducts.has(product.id);

                return (
                  <tr key={product.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleProductSelection(product.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          {product.brand && (
                            <div className="text-sm text-gray-500">{product.brand}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{product.sku || '-'}</td>
                    <td className="p-4 text-sm text-gray-600">{product.category || '-'}</td>
                    <td className="p-4 font-medium text-gray-900">${parseFloat(product.price).toFixed(2)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{product.stock}</span>
                        {product.stock < 5 && (
                          <TrendingDown className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <input
                        type="number"
                        value={bulkUpdate?.newStock ?? ''}
                        onChange={(e) => updateProductStock(product.id, parseInt(e.target.value) || 0)}
                        placeholder="New stock"
                        className="w-24 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        defaultValue={0}
                      />
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                        <stockStatus.icon className="w-3 h-3" />
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {bulkUpdate && (
                          <button
                            onClick={() => setBulkUpdates(prev => prev.filter(u => u.productId !== product.id))}
                            className="text-orange-600 hover:text-orange-700"
                            title="Remove update"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => window.open(`/products/${product.slug}`, '_blank')}
                          className="text-blue-600 hover:text-blue-700"
                          title="View product"
                        >
                          <Package className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Update Panel */}
      {showBulkUpdatePanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Bulk Stock Update</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set stock for all selected products ({selectedProducts.size})
                </label>
                <input
                  type="number"
                  value={bulkStockValue}
                  onChange={(e) => setBulkStockValue(e.target.value)}
                  placeholder="Enter stock number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Reason (optional)
                </label>
                <textarea
                  value={updateReason}
                  onChange={(e) => setUpdateReason(e.target.value)}
                  placeholder="e.g., Restock, Inventory count, Seasonal adjustment"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={applyBulkStock}
                  disabled={!bulkStockValue}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Apply to Selected
                </button>
                <button
                  onClick={() => setShowBulkUpdatePanel(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold">Confirm Stock Updates</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              You are about to update stock for {bulkUpdates.length} product{bulkUpdates.length !== 1 ? 's' : ''}. 
              This action will immediately affect inventory levels.
            </p>

            <div className="space-y-2 mb-6">
              {bulkUpdates.slice(0, 3).map(update => (
                <div key={update.productId} className="text-sm text-gray-600">
                  {update.productName}: {update.currentStock} → {update.newStock}
                </div>
              ))}
              {bulkUpdates.length > 3 && (
                <div className="text-sm text-gray-500">
                  ...and {bulkUpdates.length - 3} more
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={executeBulkUpdates}
                disabled={updating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {updating ? (
                  <RefreshCw className="animate-spin w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {updating ? 'Updating...' : 'Confirm Updates'}
              </button>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Execute Updates Button */}
      {bulkUpdates.length > 0 && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setShowConfirmDialog(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Apply {bulkUpdates.length} Update{bulkUpdates.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Stock History */}
      {showHistory && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Recent Stock Updates</h3>
          <div className="space-y-2">
            {stockHistory.slice(0, 10).map((history, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-gray-900">{history.productName}</div>
                  <div className="text-sm text-gray-600">
                    {history.previousStock} → {history.newStock} units
                    {history.reason && ` • ${history.reason}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{history.updatedBy}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(history.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
            {stockHistory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No stock updates yet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
