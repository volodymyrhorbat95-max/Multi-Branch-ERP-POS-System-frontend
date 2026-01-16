import React, { useState, useEffect } from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { getSyncQueueStatus, getPendingSalesCount } from '../../services/offline/syncProcessor';
import ConflictResolutionModal from './ConflictResolutionModal';
import FailedSyncModal from './FailedSyncModal';
import { MdArrowBack, MdWifiOff, MdSync, MdWarning, MdError } from 'react-icons/md';

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
          <MdArrowBack className="w-5 h-5" />
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
            <MdWifiOff className="w-4 h-4" />
            <span className="text-xs font-medium">
              SIN CONEXIÓN {pendingSalesCount > 0 && `(${pendingSalesCount} ventas)`}
            </span>
          </div>
        )}

        {isOnline && syncStatus.pending > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-md border border-blue-300 dark:border-blue-700">
            <MdSync className="w-4 h-4 animate-spin" />
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
            <MdWarning className="w-4 h-4" />
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
            <MdError className="w-4 h-4" />
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
