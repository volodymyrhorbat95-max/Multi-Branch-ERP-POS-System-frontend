import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy load subpages
const ProductsListPage = React.lazy(() => import('./ProductsListPage'));
const BulkPriceUpdate = React.lazy(() => import('./BulkPriceUpdate'));

const ProductsPage: React.FC = () => {
  return (
    <React.Suspense fallback={
      <div className="p-6 flex justify-center">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    }>
      <Routes>
        <Route index element={<ProductsListPage />} />
        <Route path="bulk-update" element={<BulkPriceUpdate />} />
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </React.Suspense>
  );
};

export default ProductsPage;
