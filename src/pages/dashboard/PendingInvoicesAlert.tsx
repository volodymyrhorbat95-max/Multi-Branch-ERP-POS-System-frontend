import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchInvoiceStats, retryPendingInvoices } from '../../store/slices/invoicesSlice';
import { useNavigation } from '../../hooks';
import { Button } from '../../components/ui';

const PendingInvoicesAlert: React.FC = () => {
  const dispatch = useAppDispatch();
  const { goTo } = useNavigation();
  const { stats } = useAppSelector((state) => state.invoices);
  const { currentBranch } = useAppSelector((state) => state.auth);
  const loading = useAppSelector((state) => state.ui.loading);

  useEffect(() => {
    dispatch(fetchInvoiceStats({
      branch_id: currentBranch?.id,
    }));
  }, [dispatch, currentBranch?.id]);

  const handleRetryPending = async () => {
    await dispatch(retryPendingInvoices(currentBranch?.id));
    dispatch(fetchInvoiceStats({
      branch_id: currentBranch?.id,
    }));
  };

  const handleViewInvoices = () => {
    goTo('/invoices');
  };

  if (!stats || stats.pending_count === 0) {
    return null;
  }

  return (
    <div className="bg-warning-50 dark:bg-warning-900/20 border-l-4 border-warning-500 p-6 rounded-sm shadow-md animate-fade-down duration-fast">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/30 rounded-full flex items-center justify-center animate-pulse-slow">
            <svg className="w-6 h-6 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 animate-fade-right duration-normal">
          <h3 className="text-lg font-semibold text-warning-800 dark:text-warning-300 mb-2">
            Facturas Pendientes de AFIP
          </h3>
          <p className="text-warning-700 dark:text-warning-400 mb-4">
            Hay <span className="font-bold">{stats.pending_count}</span> factura{stats.pending_count > 1 ? 's' : ''} pendiente{stats.pending_count > 1 ? 's' : ''} de envío a AFIP.
            {stats.pending_count > 1
              ? ' Estas facturas no tienen CAE y deben ser procesadas.'
              : ' Esta factura no tiene CAE y debe ser procesada.'}
          </p>

          <div className="flex flex-wrap gap-3 animate-fade-up duration-light-slow">
            <Button
              variant="warning"
              onClick={handleRetryPending}
              disabled={loading}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
              iconPosition="left"
            >
              Reintentar Envío
            </Button>

            <Button
              variant="secondary"
              onClick={handleViewInvoices}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              iconPosition="left"
            >
              Ver Todas las Facturas
            </Button>
          </div>
        </div>

        <button
          onClick={() => {/* Close alert - could add to local storage */}}
          className="flex-shrink-0 text-warning-600 dark:text-warning-400 hover:text-warning-800 dark:hover:text-warning-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PendingInvoicesAlert;
