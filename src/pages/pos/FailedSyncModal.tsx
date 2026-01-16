import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { db } from '../../services/db';
import type { LocalSyncQueueItem } from '../../services/db';
import { retryFailedSync } from '../../services/offline/syncProcessor';
import { useAppSelector } from '../../store';
import { showToast } from '../../store/slices/uiSlice';
import { useAppDispatch } from '../../store';
// UUID type imported but used in type annotations elsewhere
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface FailedSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetryComplete: () => void;
}

const FailedSyncModal: React.FC<FailedSyncModalProps> = ({
  isOpen,
  onClose,
  onRetryComplete,
}) => {
  const dispatch = useAppDispatch();
  const { currentBranch, currentSession } = useAppSelector((state) => state.auth);

  const [failedItems, setFailedItems] = useState<LocalSyncQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState<number | null>(null);
  const [retryingAll, setRetryingAll] = useState(false);

  // Fetch failed items when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchFailedItems();
    }
  }, [isOpen]);

  const fetchFailedItems = async () => {
    setLoading(true);
    try {
      const failed = await db.syncQueue
        .where('status')
        .equals('FAILED')
        .toArray();

      setFailedItems(failed);
    } catch (error) {
      console.error('[FailedSync] Error fetching failed items:', error);
      dispatch(showToast({
        type: 'error',
        message: 'Error al cargar elementos fallidos',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleRetryItem = async (itemId: number) => {
    if (!currentBranch?.id || !currentSession?.register_id) {
      dispatch(showToast({
        type: 'error',
        message: 'No hay sucursal o registro activo',
      }));
      return;
    }

    setRetrying(itemId);
    try {
      // Mark item as PENDING for retry
      await db.syncQueue
        .where('id')
        .equals(itemId)
        .modify((item) => {
          item.status = 'PENDING';
          item.retry_count = 0;
          item.error_message = undefined;
        });

      // Retry sync for this specific item
      const result = await retryFailedSync(
        currentBranch.id,
        currentSession.register_id,
        1 // Max 1 retry attempt
      );

      if (result.processed > 0) {
        dispatch(showToast({
          type: 'success',
          message: 'Reintento exitoso',
        }));

        // Remove from failed list
        setFailedItems((prev) => prev.filter((item) => item.id !== itemId));

        // Notify parent
        onRetryComplete();

        // Close if no more failed items
        if (failedItems.length === 1) {
          onClose();
        }
      } else if (result.failed > 0) {
        dispatch(showToast({
          type: 'error',
          message: 'El reintento falló. Revisa el error.',
        }));
        // Refresh list to get updated error message
        await fetchFailedItems();
      }
    } catch (error) {
      console.error('[FailedSync] Error retrying item:', error);
      dispatch(showToast({
        type: 'error',
        message: 'Error al reintentar sincronización',
      }));
      await fetchFailedItems();
    } finally {
      setRetrying(null);
    }
  };

  const handleRetryAll = async () => {
    if (!currentBranch?.id || !currentSession?.register_id) {
      dispatch(showToast({
        type: 'error',
        message: 'No hay sucursal o registro activo',
      }));
      return;
    }

    setRetryingAll(true);
    try {
      // Mark all failed items as PENDING
      await db.syncQueue
        .where('status')
        .equals('FAILED')
        .modify((item) => {
          item.status = 'PENDING';
          item.retry_count = 0;
          item.error_message = undefined;
        });

      // Retry sync with max 3 attempts
      const result = await retryFailedSync(
        currentBranch.id,
        currentSession.register_id,
        3
      );

      if (result.processed > 0) {
        dispatch(showToast({
          type: 'success',
          message: `${result.processed} elemento(s) procesados. ${result.failed} fallidos.`,
        }));

        // Refresh list
        await fetchFailedItems();

        // Notify parent
        onRetryComplete();

        // Close if all succeeded
        if (result.failed === 0) {
          onClose();
        }
      } else {
        dispatch(showToast({
          type: 'warning',
          message: 'No se pudieron procesar los elementos. Revisa los errores.',
        }));
        await fetchFailedItems();
      }
    } catch (error) {
      console.error('[FailedSync] Error retrying all:', error);
      dispatch(showToast({
        type: 'error',
        message: 'Error al reintentar sincronizaciones',
      }));
      await fetchFailedItems();
    } finally {
      setRetryingAll(false);
    }
  };

  const handleDiscardItem = async (itemId: number) => {
    try {
      // Delete from sync queue
      await db.syncQueue.delete(itemId);

      dispatch(showToast({
        type: 'success',
        message: 'Elemento descartado',
      }));

      // Remove from list
      setFailedItems((prev) => prev.filter((item) => item.id !== itemId));

      // Close if no more failed items
      if (failedItems.length === 1) {
        onClose();
      }
    } catch (error) {
      console.error('[FailedSync] Error discarding item:', error);
      dispatch(showToast({
        type: 'error',
        message: 'Error al descartar elemento',
      }));
    }
  };

  const getEntityTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      SALE: 'Venta',
      STOCK_MOVEMENT: 'Movimiento de Stock',
      REGISTER_SESSION: 'Sesión de Caja',
      CUSTOMER: 'Cliente',
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sincronizaciones Fallidas"
      size="lg"
      closeOnOverlayClick={false}
    >
      <div className="space-y-4">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando elementos fallidos...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && failedItems.length === 0 && (
          <div className="text-center py-12">
            <CheckCircleOutlineIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <p className="text-gray-600 text-lg">No hay sincronizaciones fallidas</p>
            <p className="text-gray-500 text-sm mt-2">
              Todos los elementos se han sincronizado exitosamente
            </p>
            <Button
              variant="secondary"
              className="mt-6"
              onClick={onClose}
            >
              Cerrar
            </Button>
          </div>
        )}

        {/* Failed Items List */}
        {!loading && failedItems.length > 0 && (
          <>
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex items-start">
                <ErrorOutlineIcon className="text-red-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    {failedItems.length} sincronización{failedItems.length !== 1 ? 'es' : ''} fallida{failedItems.length !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    Estos elementos no pudieron sincronizarse con el servidor. Puedes reintentar o descartarlos.
                  </p>
                </div>
              </div>
            </div>

            {/* Retry All Button */}
            <div className="flex justify-end mb-3">
              <Button
                variant="primary"
                onClick={handleRetryAll}
                disabled={retryingAll}
                className="flex items-center gap-2"
              >
                <RefreshIcon className="h-4 w-4" />
                {retryingAll ? 'Reintentando Todo...' : 'Reintentar Todos'}
              </Button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {failedItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-md p-4 bg-white hover:shadow-md transition-shadow"
                >
                  {/* Item Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                          {getEntityTypeLabel(item.entity_type)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ID Local: {item.entity_local_id.substring(0, 8)}...
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(item.local_created_at)}
                      </p>
                    </div>
                    {item.retry_count > 0 && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Intentos: {item.retry_count}
                      </span>
                    )}
                  </div>

                  {/* Error Message */}
                  {item.error_message && (
                    <div className="bg-red-50 rounded p-3 mb-3">
                      <p className="text-sm text-red-700">
                        <span className="font-medium">Error:</span> {item.error_message}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleRetryItem(item.id!)}
                      disabled={retrying === item.id || retryingAll}
                      className="flex items-center gap-1"
                    >
                      <RefreshIcon className="h-4 w-4" />
                      {retrying === item.id ? 'Reintentando...' : 'Reintentar'}
                    </Button>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDiscardItem(item.id!)}
                      disabled={retrying === item.id || retryingAll}
                      className="flex items-center gap-1"
                    >
                      <DeleteOutlineIcon className="h-4 w-4" />
                      Descartar
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={fetchFailedItems}
                disabled={loading || retryingAll}
              >
                <RefreshIcon className="h-4 w-4 mr-2" />
                Actualizar Lista
              </Button>
              <Button
                variant="secondary"
                onClick={onClose}
              >
                Cerrar
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default FailedSyncModal;
