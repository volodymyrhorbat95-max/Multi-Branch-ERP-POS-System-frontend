import React from 'react';
import type { InvoiceStats } from '../../services/api/invoice.service';

interface InvoiceStatsCardsProps {
  stats: InvoiceStats;
}

const InvoiceStatsCards: React.FC<InvoiceStatsCardsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Invoices */}
      <div className="bg-white dark:bg-gray-800 rounded-sm shadow-md p-6 border-l-4 border-primary-500 animate-fade-right duration-fast">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Facturas</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totals.total_count}
            </p>
          </div>
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
            <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Total Amount */}
      <div className="bg-white dark:bg-gray-800 rounded-sm shadow-md p-6 border-l-4 border-success-500 animate-fade-up duration-normal">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monto Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(stats.totals.total_amount)}
            </p>
          </div>
          <div className="p-3 bg-success-100 dark:bg-success-900/30 rounded-full">
            <svg className="w-6 h-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Total Tax */}
      <div className="bg-white dark:bg-gray-800 rounded-sm shadow-md p-6 border-l-4 border-info-500 animate-fade-left duration-light-slow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">IVA Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(stats.totals.total_tax)}
            </p>
          </div>
          <div className="p-3 bg-info-100 dark:bg-info-900/30 rounded-full">
            <svg className="w-6 h-6 text-info-600 dark:text-info-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Pending Count */}
      <div className={`bg-white dark:bg-gray-800 rounded-sm shadow-md p-6 border-l-4 ${
        stats.pending_count > 0 ? 'border-warning-500' : 'border-gray-300 dark:border-gray-600'
      } animate-fade-down duration-slow`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pendientes</p>
            <p className={`text-2xl font-bold ${
              stats.pending_count > 0 ? 'text-warning-600 dark:text-warning-400' : 'text-gray-900 dark:text-white'
            }`}>
              {stats.pending_count}
            </p>
          </div>
          <div className={`p-3 rounded-full ${
            stats.pending_count > 0
              ? 'bg-warning-100 dark:bg-warning-900/30'
              : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <svg className={`w-6 h-6 ${
              stats.pending_count > 0
                ? 'text-warning-600 dark:text-warning-400'
                : 'text-gray-400'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* By Type Breakdown */}
      {stats.by_type.length > 0 && (
        <div className="md:col-span-2 lg:col-span-4 bg-white dark:bg-gray-800 rounded-sm shadow-md p-6 animate-fade-up duration-normal">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Facturas por Tipo
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {stats.by_type.map((item) => (
              <div
                key={item.invoice_type}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-sm animate-zoom-in duration-fast"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tipo {item.invoice_type}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {item.count}
                </p>
                <p className="text-sm text-primary-600 dark:text-primary-400">
                  {formatCurrency(item.total)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceStatsCards;
