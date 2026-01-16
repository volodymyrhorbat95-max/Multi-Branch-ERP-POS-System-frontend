import React, { useState, lazy, Suspense, useMemo, useCallback } from 'react';

// Lazy load report components for better initial load performance
const DailyReport = lazy(() => import('./DailyReport'));
const SalesReport = lazy(() => import('./SalesReport'));
const ProductReport = lazy(() => import('./ProductReport'));
const CashierReport = lazy(() => import('./CashierReport'));
const InventoryReport = lazy(() => import('./InventoryReport'));
const CategoryReport = lazy(() => import('./CategoryReport'));
const DiscrepancyReport = lazy(() => import('./DiscrepancyReport'));
const PaymentMethodReport = lazy(() => import('./PaymentMethodReport'));
const ShrinkageReport = lazy(() => import('./ShrinkageReport'));
const HourlyReport = lazy(() => import('./HourlyReport'));
const BranchComparisonReport = lazy(() => import('./BranchComparisonReport'));

type TabType = 'daily' | 'sales' | 'products' | 'cashiers' | 'inventory' | 'categories' | 'discrepancies' | 'payments' | 'shrinkage' | 'hourly' | 'comparison';

interface TabConfig {
  id: TabType;
  label: string;
  component: React.LazyExoticComponent<React.FC>;
}

const TABS: TabConfig[] = [
  { id: 'daily', label: 'Reporte Diario', component: DailyReport },
  { id: 'sales', label: 'Ventas', component: SalesReport },
  { id: 'products', label: 'Productos', component: ProductReport },
  { id: 'cashiers', label: 'Cajeros', component: CashierReport },
  { id: 'inventory', label: 'Inventario', component: InventoryReport },
  { id: 'categories', label: 'Categorías', component: CategoryReport },
  { id: 'discrepancies', label: 'Discrepancias', component: DiscrepancyReport },
  { id: 'payments', label: 'Métodos de Pago', component: PaymentMethodReport },
  { id: 'shrinkage', label: 'Mermas', component: ShrinkageReport },
  { id: 'hourly', label: 'Por Hora', component: HourlyReport },
  { id: 'comparison', label: 'Comparación', component: BranchComparisonReport },
];

const LoadingFallback: React.FC = () => (
  <div className="flex justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary-600"></div>
  </div>
);

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('daily');

  const handleTabClick = useCallback((tabId: TabType) => {
    setActiveTab(tabId);
  }, []);

  const ActiveComponent = useMemo(() => {
    const tab = TABS.find(t => t.id === activeTab);
    return tab?.component || DailyReport;
  }, [activeTab]);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-sm shadow-md p-6 animate-fade-down duration-fast">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white animate-fade-right duration-normal">Reportes</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-sm shadow-md animate-fade-up duration-normal">
        <div className="flex flex-col sm:flex-row border-b border-gray-200 dark:border-gray-700">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-zoom-in duration-normal">
        <Suspense fallback={<LoadingFallback />}>
          <ActiveComponent />
        </Suspense>
      </div>
    </div>
  );
};

export default ReportsPage;
