import React, { useState, useEffect } from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { getSyncQueueStatus, getPendingSalesCount } from '../../services/offline/syncProcessor';
import ConflictResolutionModal from './ConflictResolutionModal';
import FailedSyncModal from './FailedSyncModal';

interface TopBarProps {
  branchName?: string;
  registerName?: string;
  onBack: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ branchName, registerName, onBack }) => {
  const isOnline = useNetworkStatus();
  const [pendingSalesCount, setPendingSalesCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState({ pending: 0, failed: 0, conflicts: 0 });
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);

  // Update sync status every 5 seconds
  useEffect(() => {
    const updateStatus = async () => {
      try {
        const [status, salesCount] = await Promise.all([
          getSyncQueueStatus(),
          getPendingSalesCount()
        ]);
        setSyncStatus(status);
        setPendingSalesCount(salesCount);
      } catch (error) {
        console.error('[TopBar] Error updating sync status:', error);
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  // Refresh sync status after resolving conflicts or retrying failed syncs
  const handleRefreshStatus = async () => {
    try {
      const [status, salesCount] = await Promise.all([
        getSyncQueueStatus(),
        getPendingSalesCount()
      ]);
      setSyncStatus(status);
      setPendingSalesCount(salesCount);
    } catch (error) {
      console.error('[TopBar] Error refreshing sync status:', error);
    }
  };

  return (
    <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 animate-fade-down duration-fast">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 animate-fade-right duration-normal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white animate-fade-up duration-normal">
          Punto de Venta
        </h1>
        <span className="text-sm text-gray-500 dark:text-gray-400 animate-fade-left duration-light-slow">
          {branchName}
        </span>
      </div>

      <div className="flex items-center gap-4 animate-fade-left duration-normal">
        {/* Sync Status Badge */}
        {!isOnline && (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-md border border-yellow-300 dark:border-yellow-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
            </svg>
            <span className="text-xs font-medium">
              SIN CONEXIÓN {pendingSalesCount > 0 && `(${pendingSalesCount} ventas)`}
            </span>
          </div>
        )}

        {isOnline && syncStatus.pending > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-md border border-blue-300 dark:border-blue-700">
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-xs font-medium">
              SINCRONIZANDO... ({syncStatus.pending})
            </span>
          </div>
        )}

        {syncStatus.conflicts > 0 && (
          <button
            onClick={() => setShowConflictModal(true)}
            className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md border border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors cursor-pointer"
            title="Click para resolver conflictos"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-xs font-medium">
              CONFLICTOS ({syncStatus.conflicts})
            </span>
          </button>
        )}

        {syncStatus.failed > 0 && (
          <button
            onClick={() => setShowFailedModal(true)}
            className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-md border border-orange-300 dark:border-orange-700 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors cursor-pointer"
            title="Click para reintentar sincronizaciones fallidas"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">
              FALLIDAS ({syncStatus.failed})
            </span>
          </button>
        )}

        <span className="text-sm text-gray-500 dark:text-gray-400">
          Caja: {registerName || 'Principal'}
        </span>

        {/* Online/Offline Indicator */}
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
             title={isOnline ? 'En línea' : 'Sin conexión'} />
      </div>

      {/* Conflict Resolution Modal */}
      <ConflictResolutionModal
        isOpen={showConflictModal}
        onClose={() => setShowConflictModal(false)}
        onResolved={handleRefreshStatus}
      />

      {/* Failed Sync Modal */}
      <FailedSyncModal
        isOpen={showFailedModal}
        onClose={() => setShowFailedModal(false)}
        onRetryComplete={handleRefreshStatus}
      />
    </header>
  );
};

export default TopBar;
