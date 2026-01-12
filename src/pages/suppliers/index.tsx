import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy load pages
const SupplierListPage = React.lazy(() => import('./SupplierListPage'));
const PurchaseOrderListPage = React.lazy(() => import('./PurchaseOrderListPage'));

const SuppliersPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <Routes>
        <Route index element={<SupplierListPage />} />
        <Route path="purchase-orders" element={<PurchaseOrderListPage />} />
        <Route path="*" element={<Navigate to="/suppliers" replace />} />
      </Routes>
    </Suspense>
  );
};

export default SuppliersPage;
