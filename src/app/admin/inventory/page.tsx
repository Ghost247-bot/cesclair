"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BulkStockManager from '@/components/admin/BulkStockManager';
import InventoryAnalytics from '@/components/admin/InventoryAnalytics';

export default function InventoryManagementPage() {
  const [activeTab, setActiveTab] = useState('bulk-manager');

  return (
    <div className="min-h-screen bg-gray-50 pt-[60px] md:pt-[64px]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">
            Manage product stock levels, track inventory movements, and analyze performance
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bulk-manager">Bulk Stock Manager</TabsTrigger>
            <TabsTrigger value="analytics">Analytics & Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="bulk-manager" className="space-y-6">
            <BulkStockManager />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <InventoryAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
